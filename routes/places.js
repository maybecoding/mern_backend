const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()

const dummyPlaces = require('../dummy_places')

var urlencodedParser = bodyParser.urlencoded({ extended: false })

let dummyPlaceIndex = 3;

router.post('/', urlencodedParser, (req, res, next) => {
  console.log(req.body)
  const [lat, lng] = req.body.location.split(':')
  const place = {
    id: `p${dummyPlaceIndex ++}`,
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    address: req.body.address,
    location: {lat, lng},
    creatorId: req.body.creatorId
  }
  dummyPlaces.push(place)
  res.send(200)
})


router.get('/', (req, res, next) => {
  console.log('GET Request in Places')
  res.json({message: 'It works'})
})

router.get('/user/:uid', (req, res, next) => {
  const userPlaces = dummyPlaces.filter(place => place.creatorId === req.params.uid)
  if (userPlaces.length === 0) return res.json(404)
  return res.json(userPlaces)
})

router.get('/:pid', (req, res, next) => {
  const place = dummyPlaces.find(place => place.id === req.params.pid)
  if (!place) res.send(404)
  return res.json(place)
})

router.patch('/:pid', urlencodedParser, (req, res, next) => {
  const place = dummyPlaces.find(place => place.id === req.params.pid)
  if (!place) res.send(404)
  else {
    place.title = req.body.title || place.title
    place.description = req.body.description || place.description
    place.location = req.body.location || place.location
    res.send(200)
  }
})

router.delete('/:pid', (req, res, next) => {
  const placeIndex = dummyPlaces.findIndex(place => place.id === req.params.pid)
  console.log(placeIndex)
  if (placeIndex === -1) return res.send(404)
  else {
    dummyPlaces.splice(placeIndex, 1)
    return res.send(200)
  }
})

module.exports = router