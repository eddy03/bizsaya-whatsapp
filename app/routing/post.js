'use strict'

const _ = require('lodash')
const response = require('../models/responses')
const dataModel = require('../models/data')

module.exports = (req, res) => {
  if (_.has(req.headers, 'authorization') && req.headers.authorization === process.env.AUTHORIZATION_KEY) {
    // New data
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      let payload = JSON.parse(body)
      if (!_.isEmpty(payload) && !_.isEmpty(payload.id)) {
        dataModel.saveData(payload)
        global.log(`Update whatsapp data ${payload.id}`)
        response.ok(res)
      } else {
        response.fatal(res, 400, 'Empty payload or upsupported format payload')
      }
    })
  } else {
    response.empty(res)
  }
}
