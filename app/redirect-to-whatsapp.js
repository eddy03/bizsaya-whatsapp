'use strict'

module.exports = key => new Promise((resolve, reject) => {
  getData(key)
    .then(data => {
      if (data) {
        resolve(`https://api.whatsapp.com/send?phone=${data.phone}&text=${data.msg}`)
        data.hit++
        global.REDIS.set(key, JSON.stringify(data))
      } else {
        resolve(process.env.PORTAL_URL)
      }
    })
    .catch(reject)
})

function getData (key) {
  return new Promise((resolve, reject) => {
    global.REDIS.get(key, (err, results) => {
      if (err) {
        reject(err)
      } else if (results) {
        resolve(JSON.parse(results))
      } else {
        resolve(null)
      }
    })
  })
}
