'use strict'

const path = require('path')
const fs = require('fs')
const response = require('../models/responses')

module.exports = (req, res) => {
  const filePath = path.join(__dirname, req.method.toLowerCase())
  fs.access(`${filePath}.js`, fs.constants.R_OK, err => {
    if (err) {
      response.empty(res)
    } else {
      require(filePath)(req, res)
    }
  })
}
