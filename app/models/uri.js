'use strict'

const _ = require('lodash')
const pnModel = require('./phone-number')

let uri = {}
let uriP = {}

uri.getURI = (req, number, message) => {
  const ISDESKTOP = _.isEmpty(req.headers['user-agent'].match(/\sMobile/))
  return ISDESKTOP? uriP.toWebWhatsapp(number, message) : uriP.toAPIWhatsapp(number, message)
}

uriP.toWebWhatsapp = (number, message) => {
  return `https://web.whatsapp.com${uriP.phoneSend(number, message)}`
}

uriP.toAPIWhatsapp = (number, message) => {
  return `https://api.whatsapp.com${uriP.phoneSend(number, message)}`
}

uriP.phoneSend = (number, message = '') => {
  if(!_.isEmpty(_.trim(message))) {
    message = `&text=${message}`
  }

  return `/send?phone=${pnModel.addPrefix6(number)}${message}`
}

module.exports = uri