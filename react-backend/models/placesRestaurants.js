const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlacesRestaurantSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name field is required"]
  },
  address: {
    type: String,
    required: [true, "Address field is required"]
  },
  lat: {
    type: Number,
    required: [true]
  },
  long: {
    type: Number,
    required: [true]
  },
  rating: {
    type: Number
  }
});

const PlacesRestaurants = mongoose.model(
  "placesRestaurant",
  PlacesRestaurantSchema
);

module.exports = PlacesRestaurants;
