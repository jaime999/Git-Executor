package component

#Artifact: {
  ref: name:  "kafka"

  description: {

    srv: {
      server: {
        kfk: { protocol: "tcp", port: 9092 }
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
        protocol: http : { port: srv.server.kfk.port, path: "/health" }
        startupGraceWindow: { unit: "ms", duration: 30000, probe: true }
        frequency: "medium"
        timeout: 30000  // msec
      }
      readiness: {
        protocol: http : { port: srv.server.kfk.port, path: "/health" }
        frequency: "medium"
        timeout: 30000 // msec
      }
    }

    code: {

      worker: {
        name: "kafka"

        image: {
          hub: { name: "kfk", secret: "43905e2d3bc8925eedce7878405ef2f8a030545e9966a3a7b17a659cea67aec5" }
          tag: "bitnami/kafka:latest"
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
            HTTP_SERVER_PORT_ENV: value: "\(srv.server.kfk.port)"
            KAFKA_BROKER_ID: value: "1"
            KAFKA_CFG_LISTENERS: value: "PLAINTEXT://:9092"
            KAFKA_CFG_ADVERTISED_LISTENERS: value: "PLAINTEXT://kafka:9092"
            KAFKA_CFG_ZOOKEEPER_CONNECT: value: "zookeeper:2181"
            ALLOW_PLAINTEXT_LISTENER: value: "yes"
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
