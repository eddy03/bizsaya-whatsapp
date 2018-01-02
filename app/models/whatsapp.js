'use strict'

const dataModel = require('./data')
const pn = require('./phone-number')

let ws = {}

ws.BASE_URL = 'https://api.whatsapp.com/send?phone='

ws.getData = key => new Promise((resolve, reject) => {
  dataModel.getData(key)
    .then(data => {
      if (data) {
        const phoneNumber = pn(data.phone)

        if (phoneNumber) {
          resolve({
            to: `${ws.BASE_URL}${phoneNumber}&text=${data.msg}`,
            pageName: data.name
          })
          data.hit++
          dataModel.saveDataRAW(key, data)
          global.stat()
          global.log(`Click to ${phoneNumber} - ${key}`)
        } else {
          reject(new Error('Phone number is invalid'))
        }
      } else {
        resolve()
      }
    })
    .catch(err => reject(err))
})

module.exports = ws
