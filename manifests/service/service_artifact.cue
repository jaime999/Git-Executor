package service

import (
  f ".../server:component"
  w ".../consumer:component"
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
      // FrontEnd -> Worker (LB connector)
      evalconnector: {
        as: "lb"
        from: server: "evalclient"
        to: consumer: "consserver": _
      }
    }

  }
}
