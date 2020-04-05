const fs = require('fs') 

const { startSession } = require('mongoose')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const { getLocationByAddress } = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')


const getPlaceById = async (req, res, next) => {
  let placeId = req.params.pid, place
  if ( /^[0-9a-fA-F]{24}$/.test(placeId) ) {
    try {
      place = await Place.findById(req.params.pid)
    } catch(error) {
      return next(new HttpError('Something went wrond during finding place by id: ' + error.message, 500))
    }
  }
  if (!place) return next(new HttpError( 'Could not find place for the provided id', 404 ))

  return res.json({place: place.toObject({getters: true})})
}

const getPlacesByUserId = async (req, res, next) => {
  let user
  try {
    user = await User.findById(req.params.uid).populate('places')
  } catch(error) {
    return next(new HttpError('Something went wrond during finding user by y id: ' + error.message, 500))
  }

  if (!user) {
    return next(new HttpError('Couldn\t find user by id: ' + error.message, 500))
  }

  return res.json({places: user.places.map(place => place.toObject({getters: true}))})
}

const patchPlaceById = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({message: 'Couldn\'t update place, invalid data', errors: errors.array()})


  let placeId = req.params.pid, place
  if ( /^[0-9a-fA-F]{24}$/.test(placeId) ) {
    try {
      place = await Place.findById(req.params.pid)
    } catch(error) {
      return next(new HttpError('Something went wrond during finding place by id: ' + error.message, 500))
    }
  }
  if (!place) return next(new HttpError( 'Could not find place for the provided id', 404 ))

  const userId = req.userData.userId

  console.log(userId, place.creator)
  if (place.creator.toString() !== userId) return next(new HttpError( 'Could not edit place created by another user', 403 ))

  place.title = req.body.title || existingPlace.title
  place.description = req.body.description || existingPlace.description

  try {
    await place.save()
  } catch(error) {
    return next(new HttpError('Something went wrond during saving updated place: ' + error.message, 500))
  }
  
  res.status(200).json({place: place.toObject({getters: true}) })
}

const deletePlaceById = async (req, res, next) => {

  const placeId = req.params.pid,
    userId = req.userData.userId
  let place
  if ( /^[0-9a-fA-F]{24}$/.test(placeId) ) {
    try {
      place = await Place.findById(placeId).populate('creator')
    } catch(error) {
      return next(new HttpError('Something went wrond during finding place by id: ' + error.message, 500))
    }
  }
  if (!place) return next(new HttpError( 'Could not find place for the provided id', 404 ))

  if (place.creator.id.toString() !== userId) return next(new HttpError( 'Could not delete created by another user', 403))

  const placeImagePath = place.imageUrl
  try {
    const session = await startSession()
    session.startTransaction()
    place.creator.places.pull(place)
    await Promise.all([
      place.creator.save({session}),
      place.remove()
    ])
    await session.commitTransaction()

  } catch(error) {
    return next(new HttpError('Something went wrond during removing place: ' + error.message, 500))
  }
  fs.unlink(placeImagePath, () => console.log(`Image ${placeImagePath} sucessfully deleted`))
  
  return res.status(200).json({message: 'Place is deleted sucessfuly'})
}

const createPlace = async (req, res, next) => {
  console.log(req.userData)

  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({message: 'Couldn\'t to crate place, invalid data', errors: errors.array()})

  const { title, description, address } = req.body
  const userId = req.userData.userId
  if (!req.file || !req.file.path) {
    return next(new HttpError('Image is not provided', 500))
  }
  const imageUrl = req.file.path
  let creator
  try {
    creator = await User.findById(userId)
  } catch(error) {
    return next(new HttpError('Something went wrond during searching user by id: ' + error.message, 500))
  }

  if (!creator) return next( new HttpError('Couldn\'t create place, your user is not found'), 422)

  let location
  try {
    location = await getLocationByAddress(req.body.address)
  } catch(error) {
    return next(error)
  }

  // const place = {
  //   id: `p${uuid()}`,
  //   title: req.body.title,
  //   description: req.body.description,
  //   imageUrl: req.body.imageUrl,
  //   address: req.body.address,
  //   location,
  //   creatorId: req.body.creatorId
  // }
  // dummyPlaces.push(place)

  const place = new Place({ title, description, imageUrl, address, location, creator: creator._id})

  try {
    const session = await startSession()
    session.startTransaction()
    await place.save({session})
    creator.places.push(place)
    await creator.save({session})
    await session.commitTransaction()
  } catch(error) {
    return next(new HttpError('Couldn\'t save place details in database: ' + error.message, 500))
  }

  res.status(201).json({place})
}

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  patchPlaceById,
  deletePlaceById,
  createPlace
}