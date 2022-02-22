package models

import (
	"database/sql"
	"time"
)

// Repository represents public.repository
type Repository struct {
	ID        string         // id
	Name      sql.NullString // name
	URL       sql.NullString // url
	Status    sql.NullString // status
	Created   *time.Time     // created
	CreatedBy sql.NullString // created_by
}
