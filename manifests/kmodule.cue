package kmodule

{
	domain: "kumori.examples"
	module: "nodelab"
	version: [
		1,
		0,
		6,
	]
	cue: "v0.4.1"
	spec: [
		1,
		0,
	]
	dependencies: "kumori.systems/kumori": {
		query:  "1.0.11"
		target: "kumori.systems/kumori/@1.0.11"
	}
	sums: "kumori.systems/kumori/@1.0.11": "wEmCo3JdBB/eOBCqEXTltNjCypVjgEX/x8LKfMnlYN0="
	artifacts: {
		server: "component"
		consumer:   "component"
		lab2:  "service"
	}
}
