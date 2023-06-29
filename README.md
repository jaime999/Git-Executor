Proyecto realizado para la asignatura de Sistemas y aplicaciones distribuidas.

Servicio que te permite realizar una consulta con un repositorio de GitHub, enviarla a una cola de mensajería Kafka, y clonar y ejecutar un programa al consumirlo.

El servicio se encuentra dentro de múltiples imágenes de Docker, y puede ejecutar programas de Python, Node, entre otros. El programa devuelve un resultado por la cola que puede ser consultada mediante un identificador devuelto por el frontend
