const City = require("../models/cityModel");
const User = require('../models/userModel'); // adjust path as needed

exports.getAllCities = async (req, res) => {
  try {
    // Step 1: Fetch all users with their usernames and locations
    const users = await User.find({}, 'username locations');

    // Step 2: Map cityId => [owners]
    const cityOwnerMap = {};
    for (const user of users) {
      for (const cityId of user.locations) {
        const idStr = cityId.toString();
        if (!cityOwnerMap[idStr]) {
          cityOwnerMap[idStr] = [];
        }
        cityOwnerMap[idStr].push(user.username);
      }
    }

    // Step 3: Fetch all cities referenced by any user
    const cityIds = Object.keys(cityOwnerMap);
    const cities = await City.find({ _id: { $in: cityIds } });

    // Step 4: Attach owners to each city
    const enrichedCities = cities.map(city => {
      const cityObj = city.toObject(); // convert to plain JS object
      cityObj.owners = cityOwnerMap[city._id.toString()] || [];
      return cityObj;
    });

    res.status(200).json(enrichedCities);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Get a single city (must belong to the user)
exports.getCity = async (req, res) => {
  try {
    const cityId = req.params.id;


    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({
        status: "fail",
        message: "City not found",
      });
    }

    res.status(200).json(city);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Create a new city and associate with the user
exports.createCity = async (req, res) => {
  try {
    const newCity = await City.create(req.body);

    // Add city to user's locations
    req.user.locations.push(newCity._id);
    await req.user.save();

    res.status(201).json(newCity);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete a city (only if it belongs to the user)
exports.deleteCity = async (req, res) => {
  try {
    const cityId = req.params.id;

    if (!req.user.locations.includes(cityId)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to delete this city",
      });
    }

    const deletedCity = await City.findByIdAndDelete(cityId);
    if (!deletedCity) {
      return res.status(404).json({
        status: "fail",
        message: "City not found",
      });
    }

    // Remove city from user's locations
    req.user.locations = req.user.locations.filter(
      (id) => id.toString() !== cityId
    );
    await req.user.save();

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const updatedCity = await City.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCity) {
      return res.status(404).json({
        status: "fail",
        message: "No city found with that ID",
      });
    }

    res.status(200).json(updatedCity);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};