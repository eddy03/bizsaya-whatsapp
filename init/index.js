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

module.exports = {initData, createHTTPServer}