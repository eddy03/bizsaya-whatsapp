'use strict'

let pn = {}

pn.numberRegex = new RegExp(/^(01|601)(\d{7,10})$/)

pn.addPrefix6 = number => {
  number = number.replace(/\D/g, '')

  if (number.match(/^01/)) {
    return `6${number}`
  } else if (number.match(/^601/)) {
    return number
  } else {
    return null
  }
}

module.exports = pn