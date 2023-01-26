require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const kafka = require('./kafka')        // ++
const producer = kafka.producer()       // ++
const app = express()
const port = 3000
const jsonParser = bodyParser.json()

app.post('/', jsonParser, async (req, res) => {
  await producer.connect()
  console.log('Esto es el body', req.body)             // ++
  try {
   await producer.send({
      topic: process.env.TOPIC_PRODUCER,
      messages: [{
         // Name of the published package as key, to make sure that we process events in order
         // The message value is just bytes to Kafka, so we need to serialize our JavaScript
         // object to a JSON string. Other serialization methods like Avro are available.
         value: JSON.stringify({
            repository: req.body.repository,
            command: req.body.command
         })
      }]
   })
} catch (error) {
   console.error('Error publishing message', error)
}
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const consumer = kafka.consumer({
   groupId: process.env.GROUP_ID
})

const main = async () => {
   await consumer.connect()
   await consumer.subscribe({
      topic: process.env.TOPIC_CONSUMER,
      fromBeginning: true
   })
   await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
         console.log('Received message', {
            topic,
            partition,
            value: message.value.toString()
         })

         // console.log(message)
         
      }
   })
}

main().catch(async error => {
   console.error(error)
   try {
      await consumer.disconnect()
   } catch (e) {
      console.error('Failed to gracefully disconnect consumer', e)
   }
   process.exit(1)
})