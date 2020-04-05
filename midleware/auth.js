const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')

const salt = 'incredibly_secret_string'

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') return next()
  try {
    const [_, token] = (req.headers.authorization || '').split(' ')
    if (token) {
      const payload = jwt.verify(token, salt)
      if (payload && payload.userId) {
        req.userData = { userId: payload.userId }
        return next()
      }
    }
  }
  catch( error ) {}
  return next(new HttpError('Authorization failed!', 403))
}