package app

import (
	"encoding/json"
	"fmt"
	"github.com/nats-io/nats"
	"time"
)

func GetClicks() {
	NewInflux()
	nc, err := nats.Connect("nats://192.168.0.5:4222", nats.MaxReconnects(60), nats.ReconnectWait(2*time.Second))
	if err != nil {
		fmt.Println(err)
		return
	}
	defer nc.Close()
	ch := make(chan *nats.Msg, 128)
	_, err = nc.ChanSubscribe("click", ch)
	if err != nil {
		fmt.Println(err)
		return
	}

	for {
		msg := <-ch
		var data map[string]interface{}
		if err := json.Unmarshal(msg.Data, &data); err != nil {
			panic(err)
		}
		//fmt.Println(data)
		Save(data)
	}
}
