'use strict'

/**
 * Hi, Welcome to Bizsaya whatsapp source code.
 * Feel free to explore..
 *
 * If you find any bugs or part can be improve, Send your pull request ya..
 */

require('dotenv').config()

const init = require('./init')

init.initData()
  .then(init.initStatistics)
  .then(init.createHTTPServer)
  .then(init.getStaticContent)
  .then(() => console.log(`Bizsaya whatsapp engine is running on ${process.env.HOST}:${process.env.PORT}`))
  .catch(err => global.captureException(err))
