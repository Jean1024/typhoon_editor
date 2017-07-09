const path = require('path')
const express = require('express')
const proxy = require('http-proxy-middleware')

const app = express()

app.use(express.static(path.join(__dirname, '..')))

app.use('/hfcxapidata', function (req, res, next) {
    console.log(req.url)
    next()
})

app.use('/hfcxapidata', proxy({ target: 'http://61.4.184.171:8081', changeOrigin: true }))

app.listen(3000)

console.log('Listening on 3000...')
