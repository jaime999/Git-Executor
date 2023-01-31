package component

#Artifact: {
  ref: name:  "server"

  description: {

    srv: {
      server: {
        apiServer: { protocol: "http", port: 49160 }
      }
      client: {
        evalclient: { protocol: "http" }
      }
    }

    config: {
      parameter: {
        appconfig: {
          endpoint: "http://localhost:49160"
        }
      }
      resource: {}
    }

    // Applies to the whole role
    size: {
      bandwidth: { size: 10, unit: "M" }
    }

    probe: server: {
      liveness: {
        protocol: http : { port: srv.server.apiServer.port, path: "/health" }
        startupGraceWindow: { unit: "ms", duration: 30000, probe: true }
        frequency: "medium"
        timeout: 30000  // msec
      }
      readiness: {
        protocol: http : { port: srv.server.apiServer.port, path: "/health" }
        frequency: "medium"
        timeout: 30000 // msec
      }
    }

    code: {

      frontend: {
        name: "server"

        image: {
          hub: { name: "apiServer", secret: "af54c9b1209e3e881714c595d8097db0c0fcfabc686f7428409deec180760342" }
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
            HTTP_SERVER_PORT_ENV: value: "\(srv.server.restapi.port)"
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
