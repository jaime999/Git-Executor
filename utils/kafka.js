const { Kafka } = require('kafkajs')

const kafka = new Kafka({
   clientId: 'proyecto-git',
   brokers: [process.env.KAFKA_BITNAMI_SERVER]
})

module.exports = kafka