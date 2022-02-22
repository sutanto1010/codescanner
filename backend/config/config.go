package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strconv"
)

type Config struct {
	DB_TYPE             string `json:"DB_TYPE"`
	DB_CONNECTION       string `json:"DB_CONNECTION"`
	NATS_URL            string `json:"NATS_URL"`
	NATS_USER           string `json:"NATS_USER"`
	NATS_PASS           string `json:"NATS_PASS"`
	MAX_CONCURRENT_SCAN int64  `json:"MAX_CONCURRENT_SCAN"`
	SCANNER_WORKING_DIR string `json:"SCANNER_WORKING_DIR"`
}

var config *Config

func GetConfig() *Config {
	if config == nil {
		data, err := ioutil.ReadFile("config.json")
		if err == nil {
			err = json.Unmarshal(data, &config)
		}
		if err != nil {
			config = &Config{}
			config.DB_TYPE = os.Getenv("DB_TYPE")
			config.DB_CONNECTION = os.Getenv("DB_CONNECTION")
			config.NATS_URL = os.Getenv("NATS_URL")
			config.NATS_USER = os.Getenv("NATS_USER")
			config.NATS_PASS = os.Getenv("NATS_PASS")
			config.SCANNER_WORKING_DIR = os.Getenv("SCANNER_WORKING_DIR")
			maxScan, _ := strconv.ParseInt(os.Getenv("MAX_CONCURRENT_SCAN"), 10, 64)
			config.MAX_CONCURRENT_SCAN = maxScan
		}
	}

	return config
}
