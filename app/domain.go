package app

import (
	"time"
)

type Click struct {
	Time      time.Time
	Uri       string
	UserAgent string
	LocalIp   string
}
