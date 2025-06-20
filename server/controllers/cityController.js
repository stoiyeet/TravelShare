const City = require("../models/cityModel");
const User = require('../models/userModel'); // adjust path as needed

exports.getAllCities = async (req, res) => {
  try {
    // Step 1: Fetch all users with their usernames and locations
    const users = await User.find({}, 'username locations color');

    // Step 2: Map cityId => [owners]
    const cityOwnerMap = {};
    for (const user of users) {
      for (const cityId of user.locations) {
        const idStr = cityId.toString();
        if (!cityOwnerMap[idStr]) {
          cityOwnerMap[idStr] = [];
        }
        cityOwnerMap[idStr].push({ username: user.username, color: user.color });
      }
    }

    // Step 3: Fetch all cities referenced by any user
    const cityIds = Object.keys(cityOwnerMap);
    const cities = await City.find({ _id: { $in: cityIds } }).sort({ date: 1});

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

exports.getGeocode = async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json({
        status: "fail",
        message: "Address is required",
      });
    }

    const url = `${process.env.GOOGLE_GEOCODING_URI}${encodeURIComponent(address)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Geocoding failed or no results found",
      });
    }

    const { lat, lng } = data.results[0].geometry.location;
    res.status(200).json({ lat, lng });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
