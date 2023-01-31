package component

#Artifact: {
  ref: name:  "keycloak"

  description: {

    srv: {
      server: {
        keycl: { protocol: "http", port: 8080 }
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

    probe: keycloak: {
      liveness: {
        protocol: http : { port: srv.server.keycl.port, path: "/health" }
        startupGraceWindow: { unit: "ms", duration: 30000, probe: true }
        frequency: "medium"
        timeout: 30000  // msec
      }
      readiness: {
        protocol: http : { port: srv.server.keycl.port, path: "/health" }
        frequency: "medium"
        timeout: 30000 // msec
      }
    }

    code: {

      worker: {
        name: "keycloak"

        image: {
          hub: { name: "keycloak", secret: "c51d56696663560e0011a65ac438b63b27c993581a295fdd4b468b341b283a55" }
          tag: "quay.io/keycloak/keycloak:latest"
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
            HTTP_SERVER_PORT_ENV: value: "\(srv.server.keycl.port)"
            KEYCLOAK_ADMIN: value: "admin"
            KEYCLOAK_ADMIN_PASSWORD: value: "admin"
            KEYCLOAK_IMPORT: value: "/opt/keycloak/data/import/main-realm.json"
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
