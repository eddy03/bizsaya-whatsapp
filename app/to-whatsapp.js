'use strict'

const dataModel = require('./data')

module.exports = key => new Promise((resolve, reject) => {
  dataModel.getData(key)
    .then(data => {
      if (data) {
        resolve(`https://api.whatsapp.com/send?phone=${data.phone}&text=${data.msg}`)
        data.hit++
        dataModel.saveDataRAW(key, data)
        global.log(`Click to ${data.phone} - ${key}`)
      } else {
        resolve(process.env.PORTAL_URL)
      }
    })
    .catch(err => reject(err))
})
