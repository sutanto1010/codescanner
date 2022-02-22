package main

import "sync"

type ScanCounter struct {
	sync.Mutex
	value int64
}

func (c *ScanCounter) Increment() {
	c.Lock()
	defer c.Unlock()
	c.value++
}

func (c *ScanCounter) Decrement() {
	c.Lock()
	defer c.Unlock()
	c.value--
}

func (c *ScanCounter) Value() int64 {
	c.Lock()
	defer c.Unlock()
	return c.value
}

func NewScanCounter() *ScanCounter {
	return &ScanCounter{
		value: 0,
	}
}
