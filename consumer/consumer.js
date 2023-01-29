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
   await producer.connect()
   console.log('Environment de consumer', process.env)
   consumer.run({
      partitionsConsumedConcurrently: process.env.CONSUMERS_NUMBER,
      eachMessage: async ({ topic, partition, message }) => {
         try {
            console.log('El value es', message)
            const JSONmessageValue = JSON.parse(message.value)
            let result = ''
            if(JSONmessageValue.passwordRepository) {
               result = shell.exec(`git clone https://${JSONmessageValue.userRepository}:${JSONmessageValue.passwordRepository}@github.com/${JSONmessageValue.userRepository}/${JSONmessageValue.repository}.git`)
            }

            else {
               result = shell.exec(`git clone https://github.com/${JSONmessageValue.userRepository}/${JSONmessageValue.repository}.git`)
            }
            
            if (result.code > 0) {
               sendMessage({result: result.stderr.replace('\n', '')})
               return
            }

            shell.cd(JSONmessageValue.repository)
            const aux = shell.exec(JSONmessageValue.command).toString().replace('\n', '')
            
            shell.cd('..')
            shell.rm('-r', JSONmessageValue.repository)
            shell.exec('ls')
            sendMessage({result: aux, timeStamp: message.timestamp})
         } catch (error) {
            console.log('Eror al procesar mensaje en el consumer')
            sendMessage({result: error, timeStamp: message.timestamp})
         }
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

const sendMessage = async (value) => {
   console.log('El valor es', value)
   await producer.send({
      topic: process.env.TOPIC_PRODUCER,
      messages: [{
         // Name of the published package as key, to make sure that we process events in order
         // The message value is just bytes to Kafka, so we need to serialize our JavaScript
         // object to a JSON string. Other serialization methods like Avro are available.
         value: JSON.stringify(value)
      }]
   })
}