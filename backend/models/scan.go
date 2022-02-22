package models

import (
	"database/sql"
	"time"
)

// Scan represents public.scan
type Scan struct {
	ID           string         // id
	QueueAt      *time.Time     // queue_at
	RepositoryID sql.NullString // repository_id
	QueueBy      sql.NullString // queue_by
	ScanStart    *time.Time     // scan_start
	ScanEnd      *time.Time     // scan_end
	ScanProgress sql.NullInt64  // scan_progress
}
