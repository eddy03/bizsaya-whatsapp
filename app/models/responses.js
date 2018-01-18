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

response.success = (res, to, pageName, url) => {
  res.end(dot.success({
    to,
    pageName,
    url,
    image: 'https://storage.googleapis.com/bizsaya-assets/whatsapp_2.png'
  }))
}

response.empty = (res, msg = null) => {
  if (_.isNull(msg)) {
    msg = dot.empty({
      title: 'Tiada maklumat untuk diwhatsapp dijumpai'
    })
  }

  res.end(msg)
}

response.error = (res, msg = null) => {
  if (_.isNull(msg)) {
    msg = dot.error({
      title: 'Ralat sewaktu mendapatkan maklumat untuk diwhatsapp'
    })
  }

  res.end(msg)
}

response.homepage = res => {
  res.end(dot.index({
    image: 'https://storage.googleapis.com/bizsaya-assets/bizsaya_logo.png'
  }))
}

module.exports = response
