const axios = require('axios')
const HttpError = require('../models/http-error')

async function getLocationByAddress(address) {

  const response = await axios.get(`https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.YANDEX_API_KEY}&geocode=${encodeURI(address)}&format=json&lang=en`)
  const data = response.data
  if (!data || data.response.GeoObjectCollection.metaDataProperty.GeocoderResponseMetaData.found === 0) {
    throw new HttpError('Couldn\'t find find location for the scecified address', 422)
  }
  const [lng, lat] = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(" ")
  return { lat, lng }
}

module.exports = {
  getLocationByAddress
}