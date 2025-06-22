const express = require("express");
const cityController = require("../controllers/cityController");
const authController = require("../controllers/authController");

const router = express.Router();

// Apply auth middleware to all routes below
router.use(authController.auth);

// Cities list & creation
router
  .route("/")
  .get(cityController.getAllCities)
  .post(cityController.createCity);

router.get("/geocode", cityController.getGeocode);

// Individual city retrieval, update & deletion
router
  .route("/:id")
  .get(cityController.getCity)
  .patch(cityController.updateCity)
  .delete(cityController.deleteCity);

router.post('/:id/uploadImage', cityController.uploadCityImage);


module.exports = router;
