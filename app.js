const express = require('express')
const bodyParser = require('body-parser')

const routesPlaces = require('./routes/places')

const app = express()


app.use('/api/places', routesPlaces)

app.listen(5000)