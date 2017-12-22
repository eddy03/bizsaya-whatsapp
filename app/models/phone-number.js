'use strict'

module.exports = phoneNumber => {
  phoneNumber = phoneNumber.replace(/\D/g, '')

  if (phoneNumber.match(/^01/)) {
    return `6${phoneNumber}`
  } else if (phoneNumber.match(/^601/)) {
    return phoneNumber
  } else {
    return null
  }
}
