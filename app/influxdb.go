package app

import (
	"encoding/json"
	"fmt"
	"github.com/influxdata/influxdb/client/v2"
	"log"
	"strconv"
	"time"
)

type Influx struct {
	Conn   client.Client
	DbName string
}

var influx Influx

func NewInflux() {
	i := &Influx{}
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
		log.Fatal(err)
	}
	i.Conn = c
	i.DbName = "plotter"
	influx = *i
}

func Save(click map[string]interface{}) {
	bp, err := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  influx.DbName,
		Precision: "s",
	})
	if err != nil {
		log.Println(err)
	}

	stamp, _ := time.Parse("2006-01-02 15:04:05 -0700 MST", click["time"].(string))
	pt, err := client.NewPoint("click", mapToStringMap(click), click, stamp)
	if err != nil {
		log.Println(err)
	}
	bp.AddPoint(pt)
	err = influx.Conn.Write(bp)
	if err != nil {
		log.Println(err)
	}
}

func GetList() map[string]int64 {
	q := client.NewQuery("select count(localIP) from click where time > now() - 1h group by time(1m) fill(0)", "plotter", "s")
	var fields = make(map[string]int64)
	response, err := influx.Conn.Query(q)
	if err != nil || response.Error() != nil {
		fmt.Println(err)
	} else {
		for _, result := range response.Results {
			for _, value := range result.Series[0].Values {
				id := strconv.FormatInt(convertType(value[0]), 10)
				val := convertType(value[1])
				fields[id] = val
			}
		}
	}
	return fields
}

func GetInstanceGrouppedList() []client.Result {
	q := client.NewQuery("select count(localIP) from click where time > now() - 1d group by time(1h),localIP fill(0)", "plotter", "s")
	response, err := influx.Conn.Query(q)
	if err != nil || response.Error() != nil {
		fmt.Println(err)
	} else {
		return response.Results
	}
	return []client.Result{}
}

func convertType(val interface{}) int64 {
	var t int64
	var err error
	switch x := val.(type) {
	case json.Number:
		t, err = x.Int64()
		if err != nil {
			fmt.Println("problem converting time to int ")
		}
	}
	return t
}

func mapToStringMap(click map[string]interface{}) map[string]string {
	m := make(map[string]string)
	for key, value := range click {
		switch value := value.(type) {
		case string:
			m[key] = value
		}
	}
	return m
}
