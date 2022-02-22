package pubsub

import "github.com/nats-io/nats.go"

var nc *nats.Conn

type NATSClient struct {
	conn            *nats.Conn
	url, user, pass string
}

func (n *NATSClient) init() error {
	var err error
	if n.conn == nil {
		n.conn, err = nats.Connect(n.url, nats.UserInfo(n.user, n.pass))
		return err
	}
	return nil
}
func (n *NATSClient) Publish(topic string, message interface{}) {
	n.init()
	conn, _ := nats.NewEncodedConn(n.conn, nats.JSON_ENCODER)
	conn.Publish(topic, message)
}

func New(url, user, pass string) NATSClient {
	return NATSClient{
		url:  url,
		user: user,
		pass: pass,
	}
}

func GetNATSConnection(url, user, pass string) *nats.Conn {
	if nc == nil {
		nc, _ = nats.Connect(
			url,
			nats.UserInfo(
				user,
				pass))
	}
	return nc
}
