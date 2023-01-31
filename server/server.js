require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const kafka = require('./kafka')
const { v4: uuidv4, } = require('uuid');
const session = require('express-session');
const keycloak = require('./keycloak-config.js').initKeycloak()
const producer = kafka.producer()
const app = express()
const port = 3000
const jsonParser = bodyParser.json()
const resultsReceived = []

var memoryStore = new session.MemoryStore();

const consumer = kafka.consumer({
   groupId: process.env.GROUP_ID
})

const main = async () => {
   await consumer.connect()
   await consumer.subscribe({
      topics: [process.env.TOPIC_JOB_RESULT, process.env.TOPIC_JOB_STATUS]
   })
   await producer.connect()
   consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
         const messageValue = JSON.parse(message.value)
         let keyResult = resultsReceived.find(x => x.key === messageValue.key);
         if (topic == process.env.TOPIC_JOB_RESULT) {
            const elapsedTime = message.timestamp - messageValue.timeStamp
            keyResult.result = messageValue.result
            keyResult.elapsedTime = elapsedTime
            keyResult.status = 'Finalizado'
            console.log('Trabajo recibido', keyResult)

            return
         }

         if (topic == process.env.TOPIC_JOB_STATUS && keyResult.status == 'Enviado') {
            keyResult.status = 'Procesando'
         }
      }
   })

   app.use(session({
      secret: 'some secret',
      resave: false,
      saveUninitialized: true,
      store: memoryStore
   }));
   app.use(keycloak.middleware())

   app.post('/repo', keycloak.protect('realm:Clientes'), jsonParser, async (req, res) => {
      try {
         console.log('Enviando trabajo...')
         const key = uuidv4()
         await producer.send({
            topic: process.env.TOPIC_JOB_SENDED,
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
         resultsReceived.push({ key, status: 'Enviado' })
         res.send(`Trabajo enviado. ID asignada: ${key}`)

      } catch (error) {
         console.error('Error publicando el trabajo', error)
      }
   })

   app.post('/result', keycloak.protect('realm:Clientes'), jsonParser, async (req, res) => {
      const keyResult = resultsReceived.find(x => x.key === req.body.key);
      if (keyResult && keyResult.status == 'Finalizado') {
         res.send(`El resultado es ${keyResult.result}\nEl trabajo ha tardado en total ${keyResult.elapsedTime} milisegundos`)
      }

      else {
         res.send(`El trabajo con ID ${req.body.key} no ha sido enviado, o aun no ha finalizado`)
      }
   })
   app.post('/status', keycloak.protect('realm:Clientes'), jsonParser, async (req, res) => {
      const keyResult = resultsReceived.find(x => x.key === req.body.key);
      if (keyResult) {
         res.send(`El trabajo se encuentra en estado ${keyResult.status}`)
      }

      else {
         res.send(`El trabajo con ID ${req.body.key} no ha sido enviado`)
      }
   })

   app.listen(port, () => {
      console.log(`API Server listening in port ${port}`)
   })
}

main().catch(async error => {
   console.error(error)
   try {
      console.log('Error en el server')
      await producer.disconnect()
      await consumer.disconnect()
   } catch (e) {
      console.error('Failed to gracefully disconnect consumer and producer', e)
   }
   process.exit(1)
})