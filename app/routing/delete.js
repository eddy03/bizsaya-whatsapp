'use strict'

const _ = require('lodash')
const response = require('../models/responses')
const dataModel = require('../models/data')

module.exports = (req, res) => {
  const URL = _.clone(req.url)

  if (_.has(req.headers, 'authorization') && req.headers.authorization === process.env.AUTHORIZATION_KEY) {
    // Flush the information
    const KEY = URL.substr(1).split('/')
    if (KEY.length === 1) {
      dataModel.removeData(KEY[0])
      global.log(`Remove whatsapp data ${KEY[0]}`)
      response.ok(res)
    } else {
      response.fatal(res, 400)
    }
  } else {
    response.empty(res)
  }
}
