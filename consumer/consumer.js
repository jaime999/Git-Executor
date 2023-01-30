require('dotenv').config()
const kafka = require('./kafka')
const shell = require('shelljs')
const consumer = kafka.consumer({
   groupId: process.env.GROUP_ID
})
const producer = kafka.producer()

const main = async () => {
   await consumer.connect()
   await consumer.subscribe({
      topic: process.env.TOPIC_CONSUMER,
      fromBeginning: true
   })
   await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
         console.log(message.timestamp)
         const messageValue = message.value.toString()
         const JSONmessageValue = JSON.parse(messageValue);
         let code = shell.exec(`git clone https://github.com/jaime999/${JSONmessageValue.repository}.git`);
         if (code > 0) {
            console.error('Error en la clonación')
         }

         shell.cd(JSONmessageValue.repository)
         shell.exec('ls');

         const aux = shell.exec(JSONmessageValue.command).toString()
         console.log(`El valor es... ${aux}`)
         await producer.connect()
         try {
            await producer.send({
               topic: process.env.TOPIC_PRODUCER,
               messages: [{
                  // Name of the published package as key, to make sure that we process events in order
                  // The message value is just bytes to Kafka, so we need to serialize our JavaScript
                  // object to a JSON string. Other serialization methods like Avro are available.
                  value: JSON.stringify({
                     result: aux,
                     timeStamp: message.timestamp
                  })
               }]
            })
         } catch (error) {
            console.error('Error publishing message', error)
         }

         console.log('Received message', {
            topic,
            partition,
            // key: message.key.toString(),
            value: message.value.toString()
         })
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