package main

import (
	"fmt"
	"net/url"
	"time"

	swagger "github.com/arsmn/fiber-swagger/v2"
	"github.com/gofiber/fiber/v2"
	_ "github.com/sutanto1010/codescanner/api/docs"
	"github.com/sutanto1010/codescanner/config"
	"github.com/sutanto1010/codescanner/enums"
	"github.com/sutanto1010/codescanner/pubsub"
	"github.com/sutanto1010/codescanner/repository"
)

var conf *config.Config
var pubSub pubsub.NATSClient
var repo repository.IRepository

// @title Code Scanner API
// @version 1.0
// @description Help you to deliver better software
// @termsOfService http://twitter.com/sutanto1010/
// @host localhost:3000
// @BasePath /
func main() {
	var err error
	conf = config.GetConfig()
	pubSub = pubsub.New(conf.NATS_URL, conf.NATS_USER, conf.NATS_PASS)
	repo, err = repository.NewDBRepository(conf.DB_TYPE, conf.DB_CONNECTION)
	if err != nil {
		panic(err)
	}
	app := fiber.New()
	app.Get("/docs/*", swagger.HandlerDefault) // default
	app.Use(func(c *fiber.Ctx) error {
		return CORSMiddleware(c, "")
	})
	app.All("/crud/:table/v1", GenericCRUDV1)
	app.Post("/request-to-scan/v1", RequestToScanV1)

	app.Listen(":3000")
}

// @Summary Generic CRUD
// @Description This is generic CRUD endpoint, can be use to do CRUD for existing table or future table
// @Accept  json
// @Produce  json
// @Param table path string true "Table name"
// @Success 200 {object} Response
// @Router /crud/{table}/v1 [get]
func GenericCRUDV1(c *fiber.Ctx) error {
	resp := Response{}
	var item map[string]interface{}
	table := c.Params("table")
	var err error
	method := c.Method()
	if err == nil {
		if method == "PUT" || method == "POST" {
			err = c.BodyParser(&item)
			if err == nil {
				id, ok := item["id"]
				isNew := fmt.Sprintf("%v", id) == ""
				if !ok {
					isNew = true
				}
				if isNew {
					item, err = repo.Insert(table, item)
					resp.Data = item
				} else {
					err = repo.Update(table, item)
				}
			}
		} else if method == "DELETE" {
			err = c.BodyParser(&item)
			if err == nil {
				id := item["id"]
				err = repo.DeleteByID(table, id)
			}
		} else if method == "GET" {
			id := c.Query("id")
			if id != "" {
				item, err = repo.FindByID(table, id)
				resp.Data = item
			} else {
				var searchReq repository.SearchRequest
				err = c.QueryParser(&searchReq)
				if err == nil {
					var searchResult repository.SearchResult
					searchResult, err = repo.Search(table, searchReq)
					if err == nil {
						resp.Total = searchResult.Total
						resp.Data = searchResult.Items
					}
				}
			}
		}
	}

	if err != nil {
		resp.Success = false
		resp.Message = err.Error()
	} else {
		resp.Success = true
		resp.Message = "Success"
	}
	return resp.Do(c)
}

// @Summary Request to scan
// @Description Use this endpoint to make scan request
// @Accept  json
// @Produce  json
// @Success 200 {object} Response
// @Router /request-to-scan/v1 [post]
func RequestToScanV1(c *fiber.Ctx) error {
	var req map[string]interface{}
	err := c.BodyParser(&req)
	resp := Response{}
	if err == nil {
		repositoryID := req["id"]
		scan := map[string]interface{}{
			"repository_id": repositoryID,
			"status":        enums.SCAN_QUEUED,
			"queue_at":      time.Now(),
		}
		scan, err = repo.Insert("scan", scan)
		if err == nil {
			var repository map[string]interface{}
			repository, err = repo.FindByID("repository", repositoryID)
			if err == nil {
				repository["status"] = enums.SCAN_QUEUED
				err = repo.Update("repository", repository)
				if err == nil {
					scan["url"] = repository["url"]
					pubSub.Publish(enums.NATS_TOPIC_SCAN_REQUEST, scan)
				}
			}
		}
	}
	if err != nil {
		resp.Success = false
		resp.Message = err.Error()
	} else {
		resp.Success = true
	}
	return resp.Do(c)
}

func CORSMiddleware(c *fiber.Ctx, allowOrigin string) error {
	origin, err := url.PathUnescape(c.Query("origin"))
	if err == nil && origin != "" {
		allowOrigin = origin
	}
	c.Set("Access-Control-Allow-Origin", allowOrigin)
	c.Set("Access-Control-Allow-Credentials", "true")
	c.Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
	c.Set("Access-Control-Allow-Headers", "Cache-Control,Max-Age, Accept, Authorization, Content-Type, Content-Length, X-CSRF-Token, Token, session, Origin, Host, Connection, Accept-Encoding, Accept-Language, X-Requested-With,If-None-Match")

	if c.Method() == "OPTIONS" {
		return c.SendStatus(204)
	}

	return c.Next()
}
