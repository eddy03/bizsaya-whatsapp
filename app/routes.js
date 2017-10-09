'use strict'

const _ = require('lodash')
const redirectToWhatsapp = require('./redirect-to-whatsapp')
const injectData = require('./inject-data')

const BIZSAYA_URL = process.env.PORTAL_URL

module.exports = (req, res) => {
  // console.time('PROFILER')

  const METHOD = req.method
  const URL = req.url

  if (METHOD === 'GET') {
    // Incomming Whatsapp API

    const KEY = URL.substr(1).split('/')
    if (KEY.length === 1) {
      redirectToWhatsapp(KEY[0])
        .then(location => response(res, location))
        .catch(() => response(res))
    } else {
      response(res)
    }
  } else if (METHOD === 'POST' && _.has(req.headers, 'authorization') && req.headers.authorization === process.env.AUTHORIZATION_KEY) {
    // Feeding new information

    const KEY = URL.substr(1).split('/')
    if (KEY.length === 1) {
      injectData(KEY[0])
        .then(() => res.end())
        .catch(err => {
          if (err.toString() === 'Error: NOT FOUND') {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
          } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
          }

          res.end()
        })
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end()
    }
  } else if (METHOD === 'HEAD') {
    // Uptime robots check

    res.end('Is ready')
  } else {
    // Other routing

    response(res, BIZSAYA_URL, 301)
  }
}

function response (res, Location = BIZSAYA_URL, statusCode = 302) {
  res.writeHead(statusCode, { Location })
  res.end()

  // console.timeEnd('PROFILER')
}
