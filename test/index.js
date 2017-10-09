require('dotenv').config()

const { spawn } = require('child_process')
const fs = require('fs')
const _ = require('lodash')
const portfinder = require('portfinder')
const jsonfile = require('jsonfile')
const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const googleDatastore = require('@google-cloud/datastore')

const Redis = require('redis')
const redis = Redis.createClient({ db: parseInt(process.env.REDIS_DB) })

let URL = 'http://127.0.0.1:3004'
const VALID_WHATSAPP_DOMAIN = 'https://api.whatsapp.com/send?phone='

let BASE_KEY_TO_TEST = null

describe('Test whole API', function () {

  before('Spawn the application', function (done) {

    jsonfile.writeFileSync('./google-datastore.json', JSON.parse(fs.readFileSync('./googledatastore.txt')))

    portfinder.basePort = 3004
    portfinder.getPort(function (err, port) {

      if(err) {
        throw err
        done()
      } else if(port === 3004) {
        let app = spawn('node', ['index.js'])

        app.stdout.on('data', (data) => {
          if(_.trim(data.toString()) === 'Bizsaya whatsapp engine is running on 127.0.0.1:3004') {
            done()
          }
        })
      } else if(port !== 3004) {
        done()
      }

    })

  })

  describe('Others endpoint test', function () {

    this.retries(2)

    before('Initialize', function (done) {

      chai.use(chaiHttp)
      done()

    })

    it('Expected to return 200 if Uptime robots check on it', function (done) {

      chai.request(URL)
        .head('/')
        .end(function (err, res) {

          expect(err).to.be.null
          expect(res).to.have.status(200)
          done()

        })

    })

    it('Expected to get redirect to Bizsaya portal if going to root without any parameters', function (done) {

      this.timeout(3000)

      chai.request(URL)
        .get('/')
        .end(function (err, res) {

          expect(err).to.be.null
          expect(res).to.redirect
          expect(res).to.redirectTo(`${process.env.PORTAL_URL}/`)
          done()

        })

    })

  })

  describe('Seeding information data test', function () {

    this.retries(2)

    before(function (done) {

      const DB = googleDatastore({ keyFilename: './google-datastore.json' })

      const query = DB.createQuery(process.env.COLLECTION)
        .limit(1)

      DB.runQuery(query, (err, results) => {

        if(err) {
          throw err
        } else if(results && results.length === 1) {
          BASE_KEY_TO_TEST = results[0].id
          done()
        } else {
          throw new Error('NO RESULTS')
        }

      })

    })

    it('Expected to return error 400 if seeding with incorrect parameters condition', function (done) {

      this.timeout(3000)

      chai.request(URL)
        .post('/thisparam1/thisparam2/thisparam3')
        .set('Authorization', process.env.AUTHORIZATION_KEY)
        .end(function (err, res) {

          expect(err).to.not.be.null
          expect(res).to.have.status(400)
          done()

        })

    })

    it('Expected to return error 404 if seeding with invalid parameters', function (done) {

      this.timeout(3000)

      chai.request(URL)
        .post('/thisparamisinvalid')
        .set('Authorization', process.env.AUTHORIZATION_KEY)
        .end(function (err, res) {

          expect(err).to.not.be.null
          expect(res).to.have.status(404)
          done()

        })

    })

    it('Expected to success when seeding with valid parameters and parameters condition', function (done) {

      this.timeout(3000)

      chai.request(URL)
        .post(`/${BASE_KEY_TO_TEST}`)
        .set('Authorization', process.env.AUTHORIZATION_KEY)
        .end(function (err, res) {

          expect(err).to.be.null
          expect(res).to.have.status(200)
          done()

        })

    })

  })

  describe('Redirection to whatsapp test', function () {

    this.retries(2)

    let testData = null

    before('Prep the data information', function (done) {

      redis.get(BASE_KEY_TO_TEST, (err2, results2) => {

        if(err2 || _.isEmpty(results2)) {
          throw new Error('Cannot find data')
        }
        testData = JSON.parse(results2)

        done()

      })

    })

    it('Expected to get redirect to Bizsaya portal if the parameters is incorrect', function (done) {

      this.timeout(3000)

      chai.request(URL)
        .get('/thisparamisinvalid')
        .end(function (err, res) {

          expect(err).to.be.null
          expect(res).to.redirect
          expect(res).to.redirectTo(`${process.env.PORTAL_URL}/`)
          done()

        })

    })

    it('Expected to get redirect to official Whatsapp API if parameters is correct', function (done) {

      this.timeout(3000)

      const VALID_API = `${VALID_WHATSAPP_DOMAIN}${testData.phone}&text=${testData.msg}`

      chai.request(URL)
        .get(`/${BASE_KEY_TO_TEST}`)
        .end(function (err, res) {

          expect(err).to.be.null
          expect(res).to.redirect
          expect(res).to.redirectTo(VALID_API)
          done()

        })

    })

  })

})