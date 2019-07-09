package main

import (
	"fmt"
	"io"
	"os"
	"time"
)

// Pipper is rats
type Pipper struct {
	byteRead int
	pipe     chan (byte)
}

func (p *Pipper) Write(b []byte) (n int, err error) {

	fmt.Printf("Write called, got %d bytes\n", len(b))

	for i := range b {
		fmt.Printf("Writing byte %d to channel\n", i)
		p.byteRead++
		p.pipe <- b[i]
	}

	return len(b), nil
}

// NewPipper creates a new pipper
func NewPipper(pipe chan (byte)) Pipper {
	pipper := Pipper{
		pipe: pipe,
	}

	return pipper
}

func main() {
	bytesToRead := 5000

	file, err := os.Open("/dev/urandom")

	if err != nil {
		panic(err)
	}

	readChan := make(chan (byte), bytesToRead*2)
	readBuff := make([]byte, 0)

	pipper := NewPipper(readChan)

	go func(p *Pipper, f *os.File) {
		_, err := io.CopyN(p, f, int64(bytesToRead))
		if err != nil {
			panic(err)
		}
		f.Close()
	}(&pipper, file)

	for len(readBuff) <= bytesToRead {
		fmt.Printf("%d elements left in channel\n", len(readChan))
		readBuff = append(readBuff, <-readChan)
		time.Sleep(time.Second)
	}

}
