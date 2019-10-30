const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  author: String,
  rating: Number,
  comment: String
});

const RestaurantSchema = new Schema({
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

  website: {
    type: String
  },

  phone: {
    type: String
  },

  rating: {
    type: Number
  },

  reviews: [ReviewSchema]
});

const Restaurant = mongoose.model("restaurant", RestaurantSchema);

module.exports = Restaurant;
