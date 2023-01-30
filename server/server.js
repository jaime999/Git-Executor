require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const kafka = require('./kafka')
const {v4: uuidv4,} = require('uuid');
const producer = kafka.producer()
const app = express()
const port = 3000
const jsonParser = bodyParser.json()
const jobsSubmitted = []
const resultsReceived = []

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
         resultsReceived.push({key:messageValue.key, result: messageValue.result, elapsedTime })
         console.log('Trabajo recibido', {
            topic,
            partition,
            result: messageValue.result,
            elapsedTime
         })
      }
   })

   app.post('/', jsonParser, async (req, res) => {
      try {
         console.log('Enviando trabajo...')
         jobsSubmitted.push(JSON.stringify(req.body))
         const key = uuidv4()
         await producer.send({
            topic: process.env.TOPIC_PRODUCER,
            messages: [{
               key,
               value: JSON.stringify({
                  repository: req.body.repository,
                  command: req.body.command,
                  userRepository: req.body.userRepository,
                  passwordRepository: req.body.passwordRepository
               })
            }]
         })

         res.send(`Trabajo enviado. ID asignada: ${key}`)

      } catch (error) {
         console.error('Error publicando el trabajo', error)
      }      
   })

   app.post('/result', jsonParser, async (req, res) => {
      const keyResult = resultsReceived.find(x => x.key === req.body.key);
      if(keyResult) {
         res.send(`El resultado es ${keyResult.result}\nEl trabajo ha tardado en total ${keyResult.elapsedTime} milisegundos`)
      }

      else {
         res.send(`El trabajo con ID ${req.body.key} aún no se ha enviado, o no ha llegado`)
      }
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