package main

import "github.com/gofiber/fiber/v2"

type Response struct {
	Success bool        `json:"Success"`
	Message string      `json:"Message"`
	Data    interface{} `json:"Data"`
	Total   int64       `json:"Total"`
}

func (r *Response) Do(c *fiber.Ctx) error {
	if !r.Success {
		c.Status(fiber.StatusInternalServerError)
	}
	return c.JSON(r)
}
