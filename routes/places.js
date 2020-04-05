const router = require('express').Router()
const { check } = require('express-validator')
const upload = require('../midleware/upload')
const auth = require('../midleware/auth')


const { getPlaceById, getPlacesByUserId, patchPlaceById, deletePlaceById, createPlace } = require('../controllers/places')


router.get('/user/:uid', getPlacesByUserId)
router.get('/:pid', getPlaceById)

router.use(auth)

router.post('/', upload.single('image'), [
  check('title').notEmpty(),
  check('description').isLength({min: 5}),
  check('address').notEmpty()
], createPlace)

router.patch('/:pid', [
  check('title').notEmpty(),
  check('description').isLength({min: 5})
],patchPlaceById)

router.delete('/:pid', deletePlaceById)

module.exports = router