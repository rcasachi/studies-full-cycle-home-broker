package main

import (
	"fmt"
	"github.com/rcasachi/home-broker/stock/internal/market/transformer"
	"encoding/json"
	"github.com/rcasachi/home-broker/stock/internal/market/dto"
	"github.com/rcasachi/home-broker/stock/internal/infra/kafka"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"sync"
	"github.com/rcasachi/home-broker/stock/internal/market/entities"
)

func main() {
	ordersIn := make(chan *entities.Order)
	ordersOut := make(chan *entities.Order)
	wg := &sync.WaitGroup{}
	defer wg.Wait()

	kafkaMsgChan := make(chan *ckafka.Message)
	configMap := &ckafka.ConfigMap{
		// /etc/hosts
		// 127.0.0.1 host.docker.internal
		"bootstrap.servers": "host.docker.internal:9094",
		"group.id": "myGroup",
		"auto.offset.reset": "latest",
	}

	producer := kafka.NewKafkaProducer(configMap)
	kafka := kafka.NewConsumer(configMap, []string{"input"})

	go kafka.Consume(kafkaMsgChan)

	book := entities.NewBook(ordersIn, ordersOut, wg)
	go book.Trade()

	go func() {
		for msg := range kafkaMsgChan {
			wg.Add(1)
			fmt.Println(string(msg.Value))
			tradeInput := dto.TradeInput{}
			err := json.Unmarshal(msg.Value, &tradeInput)
			if err != nil {
				panic(err)
			}
			order := transformer.TransformInput(tradeInput)
			ordersIn <- order
		}
	}()

	for res := range ordersOut {
		output := transformer.TransformOutput(res)
		outputJson, err := json.MarshalIndent(output, "", "  ")
		fmt.Println(string(outputJson))
		if err != nil {
			fmt.Println(err)
		}

		producer.Publish(outputJson, []byte("orders"), "output")
	}
}