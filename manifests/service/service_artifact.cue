package service

import (
  f ".../server:component"
  w ".../consumer:component"
  ka ".../kafka:component"
  ke "../keycloak:component"
)

#Artifact: {
  ref: name: "lab2"

  description: {

    //
    // Kumori Component roles and configuration
    //

    // Configuration (parameters and resources) to be provided to the Kumori
    // Service Application.
    config: {
      parameter: {
        language: string
      }
      resource: {}
    }

    // List of Kumori Components of the Kumori Service Application.
    role: {
      server: artifact: f.#Artifact
      consumer: artifact: w.#Artifact
      kafka: artifact: ka.#Artifact
      keycloak: artifact: ke.#Artifact
    }

    // Configuration spread:
    // Using the configuration service parameters, spread it into each role
    // parameters
    role: {
      server: {
        config: {
          parameter: {}
          resource: {}
        }
      }
      kafka: {
        config: {
          parameter: {}
          resource: {}
        }
      }
      keycloak: {
        config: {
          parameter: {}
          resource: {}
        }
      }

      consumer: {
        config: {
          parameter: {
            appconfig: {
              language: description.config.parameter.language
            }
          }
          resource: {}
        }
      }
    }

    //
    // Kumori Service topology: how roles are interconnected
    //

    // Connectivity of a service application: the set of channels it exposes.
    srv: {
      server: {
        lab: { protocol: "http", port: 80 }
      }
      client:{
        labk: { protocol:"tcp" }
      }
    }

    // Connectors, providing specific patterns of communication among channels
    // and specifying the topology graph.
    connect: {
      // Outside -> FrontEnd (LB connector)
      serviceconnector: {
        as: "lb"
  			from: self: "lab"
        to: server: "apiServer": _
      }
      // Outside -> keycloak (LB connector)
      serviceconnector: {
        as: "lb"
  			from: self: "lab"
        to: keycloak: "keycl": _
      }
      // FrontEnd -> kafka (LB connector)
      skafkaconnector: {
        as: "lb"
        from: server: "serverkafka"
        to: kafka: "kfk": _
      }
      // kafka -> FrontEnd (LB connector)
      kafkasconnector: {
        as: "lb"
        from: kafka: "kfk"
        to: server: "serverkafka": _
      }
      // kafka -> Worker (LB connector)
      kafkacconnector: {
        as: "lb"
        from: kafka: "kfk"
        to: consumer: "consserver": _
      }
      // Worker -> kafka (LB connector)
      kafkacconnector: {
        as: "lb"
        from: consumer: "consserver"
        to: kafka: "kfk": _
      }
    }

  }
}
