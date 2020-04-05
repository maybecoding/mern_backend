const { model, Schema } = require('mongoose')

const userSchema = new Schema({
  name: {type: 'String', required: true},
  email: {type: 'String', required: true, unique: true},
  password: {type: 'String', required: true, minlength: 6},
  imageUrl: {type: 'String', required: true},
  places: [{type: Schema.Types.ObjectId, required: true, ref: 'Place'}],
})

//userSchema.index({email: 1}, {unique: true})
userSchema.path('email').index({unique: true})

module.exports = model('User', userSchema)