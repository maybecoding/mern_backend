const express = require('express')
const bodyParser = require('body-parser')

const routesPlaces = require('./routes/places')
const routesUsers = require('./routes/users')

const HttpError = require('./models/http-error')
const mongoose = require('mongoose')



const fs = require('fs')
const path = require('path')

const app = express()
app.use('/uploads/images', express.static(path.resolve('uploads', 'images')))

let cnt = 0
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  //res.setHeader('Access-Control-Allow-Credentials', 'true')
  //res.setHeader('Access-Control-Max-Age', '86400')
  console.log(req.path , cnt++, new Date())
  
  next()
})
app.use(bodyParser.json())

app.use('/api/places', routesPlaces)
app.use('/api/users', routesUsers)

app.use((req, res, next) => {
  next(new HttpError('Could not find this route', '404'))
})

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => console.log(`File deleted`))
  }
  if (res.headersSent) {
    return next(error)
  }
  res.status(error.code || 500).json( { message: error.message || 'An unknown error ocured!' } )
})

const credentials = !!(process.env.DB_USER && process.env.DB_PASSWORD) ? `${process.env.DB_USER}:${process.env.DB_PASSWORD}@` : ''
const port = !!process.env.DB_PORT ? ':' + process.env.DB_PORT : ''
mongoose.connect(`mongodb+srv://${credentials}${process.env.DB_HOST}${port}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true})
//mongoose.connect('mongodb://localhost:27017/places?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
//mongoose.connect('mongodb+srv://dev:Intesa123456@cluster0-3tnlk.mongodb.net/places?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    app.listen(process.env.port || 5000)
  })
  .catch(error => {
    console.log(error)
  })