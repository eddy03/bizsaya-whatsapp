'use strict'

const _ = require('lodash')

const BIZSAYA_URL = process.env.PORTAL_URL

let response = {}

response.ok = (res, statusCode = 200, msg = 'Success') => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
  res.end(msg)
}

response.redirect = (res, url = null, statusCode = 302) => {

  if(_.isNull(url)) {
    url = BIZSAYA_URL
  }

  res.writeHead(statusCode, { Location: url })
  res.end()

}

response.fatal = (res, statusCode = 500, msg = 'There is an error. Thats all I know') => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
  res.end(msg)
}

response.empty = (res, msg = null) => {

  if(_.isNull(msg)) {
    msg = global.response.empty
  }

  res.end(msg)
}

response.error = (res, msg = null) => {

  if(_.isNull(msg)) {
    msg = global.response.error
  }

  res.end(msg)
}

module.exports = response