'use strict'

const _ = require('lodash')

const response = require('../models/responses')
const ws = require('../models/whatsapp')

// Incomming Whatsapp API
module.exports = (req, res) => {
  const URL = _.clone(req.url.substring(1))
  let number = URL.substring(0, URL.indexOf('/'))

  // Unregistered user use our API
  if (number.match(/^(01|601)(\d{7,8})$/) || URL.match(/^(01|601)(\d{7,8})$/)) {
    const baseWSURL = ws.BASE_URL
    let messages = ''

    if (URL.match(/^(01|601)(\d{7,8})$/)) {
      number = URL
    } else {
      messages = URL.substring(URL.indexOf('/')) || ''
      if (!_.isEmpty(messages)) {
        messages = messages.substring(1)
        messages = _.isEmpty(messages) ? '' : `&text=${messages}`
      }
    }

    if (req.headers.host === 'g.yobb.me') {
      res.end(`${baseWSURL}${number}${messages}`)
    } else {
      response.redirect(res, `${baseWSURL}${number}${messages}`)
      global.stat()
      global.log(`Click to ${number} - Public API`)
    }
  } else {
    const KEY = URL.split('/')
    if (KEY.length === 1) {
      ws.getKeyAndReturnURL(KEY[0])
        .then(url => response.redirect(res, url))
        .catch(err => {
          if (_.isNull(err.toString().match(/^Error: Unable to get /))) {
            global.captureException(err)
            response.error(res)
          } else {
            response.empty(res)
          }
        })
    } else {
      response.empty(res)
    }
  }
}
