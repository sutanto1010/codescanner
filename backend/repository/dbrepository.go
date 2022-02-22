package repository

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	. "xorm.io/builder"
	"xorm.io/xorm"
	"xorm.io/xorm/names"
)

var instance IRepository

type DBRepository struct {
	db     *xorm.Engine
	dbType string
}

var cacheColumns map[string]map[string]string

func NewDBRepository(dbType, connectionString string) (IRepository, error) {
	if instance == nil {
		engine, err := xorm.NewEngine(dbType, connectionString)
		engine.ShowSQL(true)
		engine.SetMapper(names.GonicMapper{})
		engine.TZLocation = time.UTC
		engine.DatabaseTZ = time.UTC
		if err != nil {
			return nil, errors.New("Unable connect to database.")
		}
		cacheColumns = map[string]map[string]string{}
		instance = &DBRepository{
			db:     engine,
			dbType: dbType,
		}
	}
	return instance, nil
}

func (r *DBRepository) Insert(table string, item map[string]interface{}) (map[string]interface{}, error) {
	item["id"] = uuid.New().String()
	cols := r.GetColumns(table)
	_, hasColumn := cols["created"]
	if hasColumn {
		item["created"] = time.Now()
	}
	_, err := r.db.Table(table).Insert(item)
	return item, err
}

func (r *DBRepository) Update(table string, item map[string]interface{}) error {
	_, err := r.db.Table(table).Where(Eq{"id": item["id"]}).Update(item)
	return err
}

func (r *DBRepository) FindByID(table string, id interface{}) (map[string]interface{}, error) {
	sql, err := Select().From(table).Where(Eq{"id": id}).ToBoundSQL()
	if err != nil {
		return nil, err
	}
	items, err := r.db.QueryInterface(sql)
	if err != nil {
		return nil, err
	}
	columns := r.GetColumns(table)
	items = MapResult(items, columns)
	if len(items) > 0 {
		return items[0], nil
	}

	return nil, nil
}

func (r *DBRepository) Search(table string, req SearchRequest) (SearchResult, error) {
	cols := strings.Split(req.AllCols, ",")
	cond := NewCond()
	if req.SearchQuery != "" {
		for _, col := range cols {
			cond = cond.Or(Like{
				"LOWER(CAST(" + col + " AS VARCHAR))",
				strings.ReplaceAll(req.SearchQuery, " ", "%"),
			})
		}
	}
	result := SearchResult{}
	sqlBuilder := Dialect(r.dbType).Select().From(table).Where(cond)
	sql, err := sqlBuilder.ToBoundSQL()
	if err != nil {
		return result, err
	}
	var total int64 = -1
	take := req.PageSize
	skip := req.PageSize * (req.Page - 1)
	if take == 0 {
		take = 10
	}
	sqlTotal := fmt.Sprintf("SELECT COUNT(*) total FROM (%s) as table_query", sql)
	items, err := r.db.QueryInterface(sqlTotal)
	if err == nil {
		columns := r.GetColumns(table)
		total, _ = strconv.ParseInt(fmt.Sprintf("%v", items[0]["total"]), 10, 64)
		count := 0
		for i := 0; i < len(req.SortBy); i++ {
			orderBy := req.SortBy[i]
			if req.SortByDesc[i] {
				orderBy = orderBy + " DESC"
			}
			sqlBuilder = sqlBuilder.OrderBy(orderBy)
			count++
		}
		if count == 0 {
			_, hasColumn := columns["created"]
			if hasColumn {
				sqlBuilder = sqlBuilder.OrderBy("created DESC")
			}
		}
		sqlBuilder = sqlBuilder.Limit(take, skip)
		result.Total = total
		sql, err = sqlBuilder.ToBoundSQL()
		if err == nil {
			items, err := r.db.QueryInterface(sql)
			if err == nil {
				result.Items = MapResult(items, columns)
			}
		}
	}

	if err != nil {
		return result, err
	}

	return result, nil
}

func MapResult(items []map[string]interface{}, columns map[string]string) []map[string]interface{} {

	for _, item := range items {
		for key, dataType := range columns {
			value := item[key]
			if value == nil {
				continue
			}

			if dataType == "timestamptz" {
				bytesValue := (value).([]byte)
				item[key] = string(bytesValue)
			}
		}

	}
	return items
}

func (r *DBRepository) DeleteByID(table string, id interface{}) error {
	_, err := r.db.Table(table).Where(Eq{"id": id}).Delete()
	return err
}

func (r *DBRepository) GetAll(table string) []map[string]interface{} {
	sql, err := Select().From(table).ToBoundSQL()
	if err != nil {
		return nil
	}
	items, err := r.db.QueryInterface(sql)
	if err != nil {
		return nil
	}
	columns := r.GetColumns(table)
	return MapResult(items, columns)
}

func (r *DBRepository) GetColumns(table string) map[string]string {
	if _, ok := cacheColumns[table]; ok {
		return cacheColumns[table]
	}
	sql, _ := Select("column_name::text", "udt_name::text").From("information_schema.columns").Where(Eq{"table_name": table}).ToBoundSQL()
	items, err := r.db.QueryInterface(sql)
	if err != nil {
		return nil
	}
	columns := map[string]string{}
	for _, item := range items {
		columns[item["column_name"].(string)] = item["udt_name"].(string)
	}
	cacheColumns[table] = columns
	return columns
}
