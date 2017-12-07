'use strict'

const dataModel = require('./data')

let ws = {}

ws.BASE_URL = 'https://api.whatsapp.com/send?phone='

ws.getKeyAndReturnURL = key => new Promise((resolve, reject) => {
  dataModel.getData(key)
    .then(data => {
      if (data) {
        resolve(`${ws.BASE_URL}${data.phone}&text=${data.msg}`)
        data.hit++
        dataModel.saveDataRAW(key, data)
        global.stat()
        global.log(`Click to ${data.phone} - ${key}`)
      } else {
        resolve(process.env.PORTAL_URL)
      }
    })
    .catch(err => reject(err))
})

module.exports = ws
