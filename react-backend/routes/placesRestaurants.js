var express = require("express");
var router = express.Router();
const PlacesRestaurant = require("../models/placesRestaurants");

/* GET users listing. */
router.get("/", function(req, res, next) {
  PlacesRestaurant.find({}).then(restaurants => {
    res.send(restaurants);
  });
});

router.post("/", function(req, res) {
  PlacesRestaurant.create(req.body).then(restaurant => {
    res.send(restaurant);
  });
});

module.exports = router;
