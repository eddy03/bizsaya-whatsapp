'use strict'

/**
 * Initialize the application configuration and setting
 *
 */

const http = require('http')
const Promise = require('bluebird')
const superagent = require('superagent')
const async = require('async')
const _ = require('lodash')
const Raven = require('raven')
const Pusher = require('pusher')
const Redis = require('redis')
const redis = Redis.createClient({db: parseInt(process.env.REDIS_DB)})

const Routes = require('../app/routes')
const dataModel = require('../app/data')

// Do we need to seed data from main database?
const seed = false

function initData () {
  return new Promise((resolve, reject) => {

    redis.on('ready', () => {
      global.REDIS = redis

      if(process.env.DEV === 'false') {
        Raven.config(process.env.SENTRY_DSN).install()
        global.captureException = err => Raven.captureException(err)
      } else {
        global.captureException = err => console.error(err.toString(), err)
      }

      if (seed === true || process.env.DEV === 'false') {
        getDataFromMainAPI()
          .then(saveIntoCache)
          .then(() => resolve())
          .catch(err => reject(err))
      } else {
        resolve()
      }
    })

    redis.on('error', err => reject(err))

  })
}

function getDataFromMainAPI () {
  return new Promise((resolve, reject) => {

    superagent.get(`${process.env.API_URL}/getdata`)
      .set('Authorization', process.env.AUTHORIZATION_KEY)
      .end((err, response) => {
        if (err || (response && response.body && response.body.success === false)) {
          reject(err)
        } else {
          resolve(response.body.data || [])
        }
      })

  })
}

function saveIntoCache (datas) {

  return new Promise(resolve => {

    async.each(datas, (data, callback) => {

      dataModel.saveData(data)
      callback()

    }, () => resolve())

  })
}

function createHTTPServer () {
  return new Promise((resolve, reject) => {

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
}

function initStatistics () {
  const _KEY = 'stats'
  global.stat = () => {
    redis.incr(_KEY)
  }

  redis.get(_KEY, (err, stats) => {
    if(stats) {
      global.hit = parseInt(stats)
    } else {
      global.hit = 0
      redis.set(_KEY, global.hit)
    }
  })

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap1',
    encrypted: true
  })

  global.log = msg => {
    const activity = `[WHATSAPP] ${msg}`
    pusher.trigger(process.env.PUSHER_CHANNEL, 'activity', { activity })
  }
}

module.exports = {initData, createHTTPServer, initStatistics}