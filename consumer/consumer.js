const { exec } = require('node:child_process');
require('dotenv').config()
const kafka = require('./kafka')
const consumer = kafka.consumer({
   groupId: process.env.GROUP_ID
})


const main = async () => {
   await consumer.connect()
   await consumer.subscribe({
      topic: process.env.TOPIC,
      fromBeginning: true
   })
   await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
         const messageValue = message.value.toString()
         JSONmessage = JSON.parse(messageValue);
         exec(`git clone https://github.com/jaime999/${JSONmessage.repository}.git`, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          });

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