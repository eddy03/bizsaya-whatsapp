'use strict'

const Promise = require('bluebird')
const _ = require('lodash')

module.exports = {

  getData: key => new Promise((resolve, reject) => {
    global.REDIS.get(key, (err, data) => {
      if (err || _.isEmpty(data)) {
        reject(_.isEmpty(data) ? new Error(`Unable to get ${key}`) : err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  }),

  saveData: data => {
    global.REDIS.set(data.id, JSON.stringify({
      phone: data.phone,
      name: data.page_name,
      msg: _.isEmpty(data.message) ? '' : encodeURIComponent(data.message),
      hit: 0
    }))
  },

  saveDataRAW: (id, data) => {
    global.REDIS.set(id, JSON.stringify(data))
  },

  removeData: key => {
    global.REDIS.del(key)
  }

}
