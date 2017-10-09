'use strict'

/**
 * Initialize the application configuration and setting
 *
 */

const Promise = require('bluebird')
const googleDatastore = require('@google-cloud/datastore')
const Redis = require('redis')
const redis = Redis.createClient({ db: parseInt(process.env.REDIS_DB) })

// Do we need to seed data from main database?
const seed = false

module.exports = () => new Promise((resolve, reject) => {
  // Please ensure you have service keys name google-datastore.json to connect to GCP datastore
  const DB = googleDatastore({ keyFilename: './google-datastore.json' })

  redis.on('ready', () => {
    if (seed === true || process.env.DEV === 'false') {
      getAllWhatsappEntriesAndSaveIntoRedis(DB, redis)
        .then(() => resolve({ DB, redis }))
        .catch(err => reject(err))
    } else {
      resolve({ DB, redis })
    }
  })

  redis.on('error', err => reject(err))
})

/**
 * Get All whatsapp entries from main DB and load it into redis DB
 *
 * @param DB Google Datastore DB
 * @param redis Redis DB
 * @return Promise
 */
function getAllWhatsappEntriesAndSaveIntoRedis (DB, redis) {
  return new Promise((resolve, reject) => {
    const query = DB.createQuery(process.env.COLLECTION)

    DB.runQueryStream(query)
      .on('error', err => reject(err))    // Something error happen...
      .on('data', entity => {
        // Save phone number and message to be send
        redis.set(entity.id, JSON.stringify({
          phone: `6${entity.phone}`,
          msg: encodeURIComponent(entity.message),
          hit: 0
        }))
      })
      .on('end', () => resolve())         // Everything is done. Continue bootup...
  })
}
