require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const kafka = require('./kafka')
const producer = kafka.producer()
const app = express()
const port = 3000
const jsonParser = bodyParser.json()
const jobsSubmitted = []

const consumer = kafka.consumer({
   groupId: process.env.GROUP_ID
})

const main = async () => {
   await consumer.connect()
   await consumer.subscribe({
      topic: process.env.TOPIC_CONSUMER
   })
   await producer.connect()
   consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
         const messageValue = JSON.parse(message.value)
         const elapsedTime = message.timestamp - messageValue.timeStamp
         console.log('Mensaje recibido', {
            result: messageValue.result,
            elapsedTime
         })
      }
   })

   app.post('/', jsonParser, async (req, res) => {
      try {
         console.log('Enviando mensaje...')
         jobsSubmitted.push(JSON.stringify(req.body))
         await producer.send({
            topic: process.env.TOPIC_PRODUCER,
            messages: [{
               // Name of the published package as key, to make sure that we process events in order
               // The message value is just bytes to Kafka, so we need to serialize our JavaScript
               // object to a JSON string. Other serialization methods like Avro are available.  
               value: JSON.stringify({
                  repository: req.body.repository,
                  command: req.body.command,
                  userRepository: req.body.userRepository,
                  passwordRepository: req.body.passwordRepository
               })
            }]
         })
         const { state } = await consumer.describeGroup()
         console.log('El estado del consumer es', state)
         // await consumer.run({
         //    eachMessage: async ({ topic, partition, message }) => {
         //       const value = JSON.parse(message.value)
         //       console.log(value)
         //       const elapsedTime = message.timestamp - value.timeStampConsumer
         //       res.send(`Respuesta recibida. El resultado es ${value.result}\nEl ElapsedTime es ${elapsedTime} milisegundos`)
         //    }
         // })
      } catch (error) {
         console.error('Error publishing message', error)
      }
      res.send('Mensaje enviado')
   })

   app.get('/jobs', () => {
      res.send(`Se han enviado los siguientes trabajos:\n${jobsSubmitted}`)
   })

   app.listen(port, () => {
      console.log(`API Server listening in port ${port}`)
   })
}

main().catch(async error => {
   console.error(error)
   try {
      console.log('Error en el server')
      await consumer.disconnect()
   } catch (e) {
      console.error('Failed to gracefully disconnect consumer', e)
   }
   process.exit(1)
})