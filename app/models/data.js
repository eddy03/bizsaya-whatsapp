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
      msg: data.message || '',
      ga: _.isEmpty(data.ga_code)? null : data.ga_code,
      pixel: _.isEmpty(data.pixel_code)? null : data.pixel_code,
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
