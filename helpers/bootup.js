'use strict'

const http = require('http')
const Promise = require('bluebird')
const Routes = require('../app/routes')

const util = require('./util')

let bootUp = {}

/**
 * Assign google DB and redis DB to global variable so no need to transfer them using parameter...
 *
 * I know it will pollute the global scope. But this is small application (service). So im using KISS here.
 *
 * @param DB
 * @param redis
 * @return Promise
 */
bootUp.assignGlobalVariable = ({ DB, redis }) => new Promise(resolve => {
  global.DB = DB
  global.REDIS = redis
  resolve()
})

/**
 * Create nodejs http server
 *
 * @return Promise
 */
bootUp.createHttpServer = () => new Promise((resolve, reject) => {
  http
    .createServer(Routes)
    .listen(process.env.PORT, process.env.HOST, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
})

/**
 * Text to be shown when everything went good
 *
 * @todo : Notify via one signal?
 */
bootUp.success = () => {
  util.console(`Bizsaya whatsapp engine is running on ${process.env.HOST}:${process.env.PORT}`)
}

/**
 * Failure to boot? Do something!
 *
 * @todo : Email admin and log to sentry
 * @param err Error object
 */
bootUp.failure = err => {
  // Catch error
  util.console(err.toString(), true)
}

module.exports = bootUp
