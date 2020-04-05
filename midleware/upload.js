const multer = require('multer')
const {v4: uuid} = require('uuid')

const MIME_TYPES = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg'
}

const upload = multer({
  limit: 500000,
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'uploads/images')
    },
    filename: (req, file, callback) => {
      const ext = MIME_TYPES[file.mimetype]
      callback(null, `${new Date().toISOString()}_${uuid()}.${ext}`)
    }
  }),
  fileFilter: (req, file, callback) => {
    const isValid = !!MIME_TYPES[file.mimetype]
    const error = isValid ? null : new Error('Mime type of image is incorrect. Must be in png, jpg, jpeg')
    return callback(error, isValid)
  }
})

module.exports = upload