'use strict'

/**
 * Hi, Welcome to Bizsaya whatsapp source code.
 * Feel free to explore..
 *
 * If you find any bugs or part can be improve, Send your pull request ya..
 */

require('dotenv').config()

const init = require('./init')
const bootupH = require('./helpers/bootup')

init()
  .then(bootupH.assignGlobalVariable)
  .then(bootupH.createHttpServer)
  .then(bootupH.success)
  .catch(bootupH.failure)
