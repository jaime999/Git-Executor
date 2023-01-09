require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const kafka = require('./kafka')        // ++
const producer = kafka.producer()       // ++
const app = express()
const port = 3000
const jsonParser = bodyParser.json()

app.post('/', jsonParser, async (req, res) => {
  await producer.connect()             // ++
  try {
   console.log(req)
   const responses = await producer.send({
      topic: process.env.TOPIC,
      messages: [{
         // Name of the published package as key, to make sure that we process events in order
         // The message value is just bytes to Kafka, so we need to serialize our JavaScript
         // object to a JSON string. Other serialization methods like Avro are available.
         value: JSON.stringify({
            repository: req.body.repository
         })
      }]
   })
   console.log('Published message', { responses })
} catch (error) {
   console.error('Error publishing message', error)
}
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})