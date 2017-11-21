'use strict'

const _ = require('lodash')
const redirectToWhatsapp = require('./to-whatsapp')
const dataModel = require('./data')

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
        .catch(err => {
          if (_.isNull(err.toString().match(/^Error: Unable to get /))) {
            global.captureException(err)
          }
          response(res)
        })
    } else {
      response(res)
    }
  } else if (METHOD === 'POST' && _.has(req.headers, 'authorization') && req.headers.authorization === process.env.AUTHORIZATION_KEY) {
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
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
      }
    })
    res.end()
  } else if (METHOD === 'DELETE' && _.has(req.headers, 'authorization') && req.headers.authorization === process.env.AUTHORIZATION_KEY) {
    // Flush the information
    const KEY = URL.substr(1).split('/')
    if (KEY.length === 1) {
      dataModel.removeData(KEY[0])
      global.log(`Remove whatsapp data ${KEY[0]}`)
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
    }
    res.end()
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
