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
const fs = require('fs')
const path = require('path')
const Raven = require('raven')
const Pusher = require('pusher')
const Redis = require('redis')
const redis = Redis.createClient({db: parseInt(process.env.REDIS_DB)})

const Routes = require('../app/routing')
const dataModel = require('../app/models/data')

// Do we need to seed data from main database?
const seed = true

/***
 * Initialize the application
 * - Connect to redis
 * - Setup Sentry
 * - Fetch data from master API and save to cache database (redis)
 *
 */
function initData () {
  return new Promise((resolve, reject) => {
    redis.on('ready', () => {
      global.REDIS = redis

      if (process.env.DEV === 'false') {
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

/***
 * Fetch data from core API
 *
 */
function getDataFromMainAPI () {
  return new Promise((resolve, reject) => {
    superagent.get(`${process.env.API_URL}/getdata`)
      .set('Authorization', process.env.TO_API_AUTH)
      .end((err, response) => {
        if (err || (response && response.body && response.body.success === false)) {
          reject(err)
        } else {
          resolve(response.body.data || [])
        }
      })
  })
}

/**
 * Save the data into cache database
 *
 * @param datas
 */
function saveIntoCache (datas) {
  return new Promise(resolve => {
    async.each(datas, (data, callback) => {
      dataModel.saveData(data)
      callback()
    }, () => resolve())
  })
}

/**
 * Bootup node.js naked http server (more speed!)
 *
 */
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

/**
 * Get ready the statistics required
 * - bind the statistics and logs functions
 * - Connect to pusher for logs streams
 *
 */
function initStatistics () {
  const _KEY = 'stats'
  global.stat = () => redis.incr(_KEY)
  redis.get(_KEY, (err, stats) => {
    if (!err && _.isEmpty(stats)) {
      redis.set(_KEY, 0)
    } else if (err) {
      global.captureException(err)
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

/**
 * Get static content and assign to variable.
 *
 */
function getStaticContent () {
  return new Promise((resolve, reject) => {

    const staticContentPath = path.join(__dirname, '..', 'app', 'static')

    global.response = {
      empty: '',
      error: ''
    }

    async.auto({

      getEmptyPage: cb => {
        fs.readFile(path.join(staticContentPath, 'empty.html'), (err, content) => cb(err, content.toString()))
      },

      getErrorPage: cb => {
        fs.readFile(path.join(staticContentPath, 'error.html'), (err, content) => cb(err, content.toString()))
      }

    }, (err, results) => {
      if(err) {
        reject(err)
      } else {
        global.response = {
          empty: results.getEmptyPage,
          error: results.getErrorPage
        }
        resolve()
      }
    })

  })
}

module.exports = {initData, createHTTPServer, initStatistics, getStaticContent}
