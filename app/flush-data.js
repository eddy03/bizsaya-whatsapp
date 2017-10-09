'use strict'

const Promise = require('bluebird')

module.exports = key => new Promise((resolve, reject) => {
  getData(key)
    .then(data => {
      if (data) {
        return deleteIt(key)
      } else {
        reject(new Error('NOT FOUND'))
      }
    })
    .then(() => resolve())
    .catch(err => reject(err))
})

function getData (key) {
  return new Promise((resolve, reject) => {
    global.REDIS.get(key, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function deleteIt (key) {
  return new Promise((resolve, reject) => {
    global.REDIS.del(key, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
