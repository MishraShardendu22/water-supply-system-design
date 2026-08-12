package migrations

import _ "embed"

//go:embed 000001_init_schema.up.sql
var UpSQL string

//go:embed 000001_init_schema.down.sql
var DownSQL string
