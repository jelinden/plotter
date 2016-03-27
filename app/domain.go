package app

import (
	"github.com/influxdata/influxdb/client/v2"
	"time"
)

type Click struct {
	Time      time.Time
	Uri       string
	UserAgent string
	LocalIp   string
}

type AllClicks struct {
	ByServer []client.Result
	All      map[string]int64
}
