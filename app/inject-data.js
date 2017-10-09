'use strict'

const Promise = require('bluebird')

module.exports = key => new Promise((resolve, reject) => {
  getData(key)
    .then(data => saveToRedis(key, data))
    .then(() => resolve())
    .catch(err => reject(err))
})

function getData (key) {
  const DB = global.DB
  const TABLE = process.env.COLLECTION

  return new Promise((resolve, reject) => {
    DB.get(DB.key([TABLE, key]), (err, results) => {
      if (err) {
        reject(err)
      } else if (results) {
        resolve(results)
      } else {
        reject(new Error('NOT FOUND'))
      }
    })
  })
}

function saveToRedis (key, data) {
  return new Promise(resolve => {
    global.REDIS.set(key, JSON.stringify({
      phone: `6${data.phone}`,
      msg: encodeURIComponent(data.message),
      hit: 0
    }))

    resolve()
  })
}
