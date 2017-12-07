'use strict'

const path = require('path')
const fs = require('fs')
const response = require('../models/responses')

module.exports = (req, res) => {

  const filePath = path.join(__dirname, req.method.toLowerCase())

  fs.exists(`${filePath}.js`, exist => {

    if(exist) {
      require(filePath)(req, res)
    } else {
      response.empty(res)
    }

  })

}