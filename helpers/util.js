'use strict'

const util = require('util')

let utilH = {}

/**
 * Show console.log on dev only...
 *
 * @param msg
 * @param error
 */
utilH.console = (msg, error = false) => {
  if (process.env.DEV === 'true') {
    if (error === true) {
      console.error(msg)
    } else {
      console.log(msg)
    }
  }
}

/**
 * Inspect object
 *
 * @param object
 */
utilH.inspect = object => {
  utilH.console(util.inspect(object, { colors: true, depth: null }))
}

module.exports = utilH
