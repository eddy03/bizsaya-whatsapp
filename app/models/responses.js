'use strict'

const _ = require('lodash')
const dot = require('dot').process({ path: './views' })

const BIZSAYA_URL = process.env.PORTAL_URL

let response = {}

response.ok = (res, statusCode = 200, msg = 'Success') => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
  res.end(msg)
}

response.redirect = (res, url = null, statusCode = 302) => {
  if (_.isNull(url)) {
    url = BIZSAYA_URL
  }

  res.writeHead(statusCode, { Location: url })
  res.end()
}

response.fatal = (res, statusCode = 500, msg = 'There is an error. Thats all I know') => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
  res.end(msg)
}

response.success = (res, to, pageName, url, backupURL = null) => {
  res.end(dot.success({
    to,
    pageName,
    url,
    backupURL
  }))
}

response.empty = (res, title = null) => {
  if (_.isNull(title)) {
    title = 'Tiada maklumat untuk diwhatsapp dijumpai'
  }

  res.end(dot.empty({ title }))
}

response.error = (res, title = null) => {
  if (_.isNull(title)) {
    title = 'Ralat sewaktu mendapatkan maklumat untuk diwhatsapp'
  }

  res.end(dot.error({ title }))
}

response.homepage = res => {
  res.end(dot.index({}))
}

module.exports = response
