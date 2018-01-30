'use strict'

const _ = require('lodash')

const response = require('../models/responses')
const ws = require('../models/whatsapp')
const pn = require('../models/phone-number')

// Incomming Whatsapp API
module.exports = (req, res) => {
  const URL = _.clone(req.url.substring(1))
  let number = URL.substring(0, URL.indexOf('/')).replace(/\D/g, '')

  // Unregistered user use our API
  if (number.match(/^(01|601)(\d{7,9})$/) || URL.match(/^(01|601)(\d{7,9})$/)) {
    const baseWSURL = ws.BASE_URL
    let messages = ''

    if (URL.match(/^(01|601)(\d{7,9})$/)) {
      number = URL
    } else {
      messages = URL.substring(URL.indexOf('/')) || ''
      if (!_.isEmpty(messages)) {
        messages = messages.substring(1)
        messages = _.isEmpty(messages) ? '' : `&text=${messages}`
      }
    }

    if (req.headers.host === 'g.yobb.me') {
      res.end(`${baseWSURL}${pn(number)}${messages}`)
    } else {

      let url = `${baseWSURL}${pn(number)}${messages}`
      const backupURL = `${baseWSURL}${pn(number)}${messages}`
      if(_.isEmpty(req.headers['user-agent'].match(/\sMobile/))) {
        url = `https://web.whatsapp.com/send?phone=${pn(number)}${messages}`
      }
      response.success(res, url, number, req.url, backupURL)
      // response.success(res, `${baseWSURL}${pn(number)}${messages}`, number, req.url)
      global.stat()
      global.log(`Click to ${pn(number)} - Public API`)
    }
  } else {

    if(URL === '/' || URL === '') {
      response.homepage(res)
    } else if (URL.match(/^send\?/)) {
      response.redirect(res, decodeURIComponent(_.clone(URL).replace('send?to=', '')))
    } else {
      const KEY = URL.split('/')
      if (URL !== '' && KEY.length === 1) {
        ws.getData(KEY[0])
          .then(data => response.success(res, data.to, data.pageName, req.url))
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
