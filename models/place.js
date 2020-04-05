const {model, Schema} = require('mongoose')

module.exports = model('Place', {
  title: {type: String, required: true},
  description: {type: String, required: true},
  imageUrl: {type: String, required: true},
  address: {type: String, required: true},
  location: {
    lat: {type: Number, required: true},
    lng: {type: Number, required: true}
  },
  creator: {type: Schema.Types.ObjectId, required: true, ref: 'User'}
})
