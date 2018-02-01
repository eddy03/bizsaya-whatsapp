'use strict'

const _ = require('lodash')

const pnModel = require('../models/phone-number')
const dataModel = require('../models/data')
const uriModel = require('../models/uri')
const response = require('../models/responses')

// Incomming Whatsapp API
module.exports = (req, res) => {
  const URL = _.clone(req.url.substring(1))
  let number = URL.substring(0, URL.indexOf('/')).replace(/\D/g, '')

  // Unregistered user use our API
  if (number.match(pnModel.numberRegex) || URL.match(pnModel.numberRegex)) {
    let messages = ''

    if (URL.match(pnModel.numberRegex)) {
      number = URL
    } else {
      messages = URL.substring(URL.indexOf('/')) || ''
      if (!_.isEmpty(messages)) {
        messages = messages.substring(1)
      }
    }

    const URLTO = uriModel.getURI(req, number, messages)
    response.success(res, URLTO, number, req.url)
    global.stat()
    global.log(`Click to ${number} - Public API`)

  } else {
    if (URL === '/' || URL === '') {
      response.homepage(res)
    } else {
      const KEY = URL.split('/')
      if (URL !== '' && KEY.length === 1) {
        const key = KEY[0]
        dataModel.getData(key)
          .then(data => {
            const URLTO = uriModel.getURI(req, data.phone, data.msg)
            const NAME = data.name || data.phone
            response.success(res, URLTO, NAME, req.url, data.ga, data.pixel)
            return data
          })
          .then(data => {
            data.hit++
            dataModel.saveDataRAW(key, data)
            global.stat()
            global.log(`Click to ${data.phone} - ${key}`)
          })
          .catch(err => {
            if (_.isNull(err.toString().match(/^Error: Unable to get /))) {
              global.captureException(err)
              response.error(res)
            } else {
              response.empty(res)
            }
          })
      } else {
        response.homepage(res)
      }
    }
  }
}
