package models

import (
	"database/sql"
	"time"
)

// Finding represents public.finding
type Finding struct {
	ID          string         // id
	ScanID      sql.NullString // scan_id
	FilePath    sql.NullString // file_path
	RuleID      sql.NullString // rule_id
	Created     *time.Time     // created
	Type        sql.NullString // type
	LineNumer   sql.NullInt64  // line_numer
	LinePreview sql.NullString // line_preview
}
