package models

import (
	"database/sql"
	"time"
)

// Rule represents public.rule
type Rule struct {
	ID          string         // id
	Code        sql.NullString // code
	Name        sql.NullString // name
	Description sql.NullString // description
	Created     *time.Time     // created
	CreatedBy   sql.NullString // created_by
	Enable      bool           // enable
	Severity    sql.NullString // severity
}
