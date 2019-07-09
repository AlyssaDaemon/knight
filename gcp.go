package knight

import (
	"context"
	"fmt"

	compute "google.golang.org/api/compute/v1"
)

// BuildVM is a dummy function
func BuildVM() {
	ctx := context.Background()
	computeService, err := compute.NewService(ctx)
	if err != nil {
		panic(err)
	}

	fmt.Println(computeService.Instances.List("foo", "us-central-1").Do())
}
