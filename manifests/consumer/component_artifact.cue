package component

#Artifact: {
  ref: name:  "consumer"

  description: {

    srv: {
      server: {
        consserver: { protocol: "http", port: 49160 }
      }
    }

    config: {
      parameter: {
        // Worker role configuration parameters
        appconfig: {
          language: string
        }
      }
      resource: {}
    }

    // Applies to the whole role
    size: {
      bandwidth: { size: 10, unit: "M" }
    }

    probe: worker: {
      liveness: {
        protocol: http : { port: srv.server.consserver.port, path: "/health" }
        startupGraceWindow: { unit: "ms", duration: 30000, probe: true }
        frequency: "medium"
        timeout: 30000  // msec
      }
      readiness: {
        protocol: http : { port: srv.server.consserver.port, path: "/health" }
        frequency: "medium"
        timeout: 30000 // msec
      }
    }

    code: {

      worker: {
        name: "consumer"

        image: {
          hub: { name: "consumer-1", secret: "d17055b0ad973411232fbb229d774dbb61e92aa5304e28ffb88764022b240dd7" }
          tag: "node:latest"
        }

        mapping: {
          // Filesystem mapping: map the configuration into the JSON file
          // expected by the component
          filesystem: {
            "/config/config.json": {
              data: value: config.parameter.appconfig
              format: "json"
            }
          }
          env: {
            CONFIG_FILE: value: "/config/config.json"
            HTTP_SERVER_PORT_ENV: value: "\(srv.server.evalserver.port)"
          }
        }

        // Applies to each containr
        size: {
          memory: { size: 100, unit: "M" }
          mincpu: 100
          cpu: { size: 200, unit: "m" }
        }
      }
    }

  }
}
