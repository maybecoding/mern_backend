const router = require('express').Router()
const { check } = require('express-validator')
const upload = require('../midleware/upload')

const { getUsers, login, signup } = require('../controllers/users')

router.get('/', getUsers)
router.post('/login', login)
router.post('/signup', upload.single('image'), [
  check('name').notEmpty(),
  check('email').normalizeEmail().isEmail(),
  check('password').isLength({min: 6})
], signup)

module.exports = router