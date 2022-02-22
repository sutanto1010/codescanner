package main

import (
	"encoding/json"
	"fmt"

	"github.com/nats-io/nats.go"
	"github.com/sutanto1010/codescanner/config"
	"github.com/sutanto1010/codescanner/enums"
	"github.com/sutanto1010/codescanner/pubsub"
	"github.com/sutanto1010/codescanner/repository"
)

var nc *nats.Conn
var conf *config.Config
var scanCount *ScanCounter
var repo repository.IRepository
var pubSub pubsub.NATSClient

func main() {
	var err error
	scanCount = NewScanCounter()
	conf = config.GetConfig()
	pubSub = pubsub.New(conf.NATS_URL, conf.NATS_USER, conf.NATS_PASS)
	repo, err = repository.NewDBRepository(conf.DB_TYPE, conf.DB_CONNECTION)
	if err != nil {
		panic(err)
	}
	nc = pubsub.GetNATSConnection(conf.NATS_URL, conf.NATS_USER, conf.NATS_PASS)
	sub, err := nc.Subscribe(enums.NATS_TOPIC_SCAN_REQUEST, func(msg *nats.Msg) {
		arg := string(msg.Data)
		var req map[string]interface{}
		json.Unmarshal([]byte(arg), &req)
		if scanCount.Value() < conf.MAX_CONCURRENT_SCAN {
			scanCount.Increment()
			go DoScan(req)
		} else {
			pubSub.Publish(enums.NATS_TOPIC_SCAN_REQUEST, req)
		}
	})
	if err != nil {
		fmt.Println(err)
	}
	for sub.IsValid() {

	}
}
