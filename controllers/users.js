const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')

const salt = 'incredibly_secret_string'

const expireTimeout = 1 * 60 * 60

const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch(error) {
    return next(new HttpError('Something went wrond during fetchind list of users: ' + error.message, 500))
  }
  res.json({users: users.map(user => user.toObject({getters: true}))})
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  let identifiedUser
  try {
    identifiedUser = await User.findOne({email})
  } catch(error) {
    return next(new HttpError('Something went wrond during searching user by email: ' + error.message, 500))
  }
  if (identifiedUser) {
    let passwordMatches
    try {
      passwordMatches = await bcrypt.compare(password, identifiedUser.password)
    } catch(error) {
      return next(new HttpError('Error comparing password with hash: ' + error.message, 500))
    }
    
    let token
    const expireDateInSec = Math.floor(Date.now() / 1000) + expireTimeout
    try {
      // token = await jwt.sign({ userId: identifiedUser.id, email: identifiedUser.email }, salt, {expiresIn: '1h'})
      token = await jwt.sign({ userId: identifiedUser.id, email: identifiedUser.email, iat: expireDateInSec  }, salt)
    } catch(error) {
      return next(error)
    }
    // If password matches with existing hash
    if (passwordMatches) return res.json({userId: identifiedUser.id, email: identifiedUser.email, token, tokenExpireDate: new Date(expireDateInSec * 1000).toISOString()})
  }
  
  return next(new HttpError('Colulnd not identify user, credentials seem to be wrong.', 401))
}

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({message: 'Couldn\'t to crate user, invalid data', errors: errors.array()})

  const { name, email, password } = req.body
  
  if (!req.file) return next(new HttpError('Please provide valid image', 422))
  
  let existingUser
  try {
    existingUser = await User.find({email})
  } catch(error) {
    return next(new HttpError('Something went wrond during searching user by email: ' + error.message, 500))
  }
  if (existingUser && existingUser.length > 0) return next(new HttpError('Couldn\'t create user, email already exists', 422))

  let passwordHash
  try {
    passwordHash = await bcrypt.hash(password, 10)
  } catch (error) {
    return next(new HttpError('Password hashing error: ' + error.message, 500))
  }

  const user = new User({
    name,
    email,
    password: passwordHash,
    imageUrl: req.file.path,
    places: []
  })

  try {
    await user.save()
  } catch(error) {
    return next(new HttpError('Something went wrond during creating user: ' + error.message, 500))
  }

  let token
  const expireDateInSec = Math.floor(Date.now() / 1000) + expireTimeout
  try {
    // token = jwt.sign({ userId: user.id, email: user.email }, salt, {expiresIn: '1h'})
    token = jwt.sign({ userId: user.id, email: user.email, iat: expireDateInSec }, salt)
  } catch(error) {
    return next(error)
  }

  res.status(201).json({userId: user.id, email: user.email, token, tokenExpireDate: new Date(expireDateInSec * 1000).toISOString()})
}

module.exports = {
  getUsers,
  login,
  signup
}