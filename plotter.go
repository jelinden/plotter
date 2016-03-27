package main

import (
	"encoding/json"
	"fmt"
	"github.com/jelinden/plotter/app"
	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
	"golang.org/x/net/websocket"
	"log"
	"time"
)

func main() {
	// listen for clicks from nats
	go app.GetClicks()

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.File("/", "public/html/index.html")
	e.Static("/css", "public/css")
	e.Static("/js", "public/js")
	e.Get("/ws", standard.WrapHandler(websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()
		for range time.Tick(time.Second) {
			allClicks := app.AllClicks{}
			allClicks.ByServer = app.GetInstanceGrouppedList()
			allClicks.All = app.GetList()
			clicks, err := json.Marshal(allClicks)
			if err != nil {
				fmt.Println(err)
			}
			err = websocket.Message.Send(ws, string(clicks))
			if err != nil {
				fmt.Printf("client closed connection %s\n", err)
				break
			}
			msg := ""
			err = websocket.Message.Receive(ws, &msg)
			if err != nil {
				fmt.Printf("client closed connection %s\n", err)
				break
			}
			log.Println("sent message to", ws.Request().RemoteAddr, msg)
		}
		ws.Close()
	})))

	e.Run(standard.New(":7000"))
}
