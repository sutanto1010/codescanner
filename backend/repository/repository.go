package repository

type IRepository interface {
	Insert(table string, item map[string]interface{}) (map[string]interface{}, error)
	Update(table string, item map[string]interface{}) error
	FindByID(table string, id interface{}) (map[string]interface{}, error)
	DeleteByID(table string, id interface{}) error
	Search(table string, req SearchRequest) (SearchResult, error)
	GetAll(table string) []map[string]interface{}
}

type SearchRequest struct {
	SearchQuery string   `query:"q" json:"q"`
	Page        int      `query:"page" json:"page"`
	PageSize    int      `query:"page_size" json:"page_size"`
	SortBy      []string `query:"sort_by[]" json:"sort_by"`
	AllCols     string   `query:"all_cols" json:"all_cols"`
	SortByDesc  []bool   `query:"sort_by_desc[]" json:"sort_by_desc"`
}

type SearchResult struct {
	Total int64       `json:"total"`
	Items interface{} `json:"items"`
}
