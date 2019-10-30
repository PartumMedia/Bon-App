var express = require("express");
var router = express.Router();
const Restaurant = require("../models/restaurants");

/* GET users listing. */
router.get("/", function(req, res, next) {
  Restaurant.find({}).then(restaurants => {
    res.send(restaurants);
  });
});

router.post("/", function(req, res) {
  Restaurant.create(req.body).then(restaurant => {
    res.send(restaurant);
  });
});

router.put("/:rating", function(req, res) {
  Restaurant.findByIdAndUpdate(req.body._id, req.body.rating).then(function(
    restaurant
  ) {
    restaurant.rating = req.body.rating;
    restaurant.save();
    res.send(restaurant);
  });
});

router.post("/:reviews", function(req, res) {
  Restaurant.findOne({ _id: req.body.restaurantId }).then(function(restaurant) {
    restaurant.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      comment: req.body.comment
    });
    restaurant.save();
    res.send(restaurant);
  });
});

router.get("/:reviews", function(req, res) {
  Restaurant.find({}).then(restaurants => {
    res.send(restaurants);
  });
});

module.exports = router;
