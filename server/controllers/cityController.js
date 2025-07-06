const City = require("../models/cityModel");
const User = require('../models/userModel');
const AWS = require('aws-sdk');
const multer = require('multer');

// Multer setup for file parsing
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

console.log("myendpoint ", process.env.CLOUDFLARE_R2_ENDPOINT);

// Configure AWS SDK for R2 (S3-compatible)
const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(process.env.CLOUDFLARE_R2_ENDPOINT),
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto'
});

// Single file upload
exports.uploadCityImage = [
  upload.single('file'), // Changed from 'image' to 'file' to match frontend
  async (req, res) => {
    try {
      const cityId = req.params.id;
      const file = req.file;
      
      console.log('Upload request received for city:', cityId);
      console.log('File received:', file ? file.originalname : 'No file');
      
      if (!file) {
        return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
      }

      const key = `${cityId}/${Date.now()}_${file.originalname}`;
      console.log('Uploading to R2 with key:', key);

      const uploadParams = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' // R2 respects this when bucket is public
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      console.log('R2 upload successful:', uploadResult.Location);

      const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
      console.log('Public URL:', fileUrl);

      // Update City document to add this image
      const updatedCity = await City.findByIdAndUpdate(
        cityId,
        { $push: { images: fileUrl } },
        { new: true, runValidators: true }
      );

      if (!updatedCity) {
        console.log('City not found with ID:', cityId);
        return res.status(404).json({ status: 'fail', message: 'City not found' });
      }

      console.log('City updated successfully with new image');
      res.status(200).json({ status: 'success', data: updatedCity });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
];

// Multiple files upload
exports.uploadCityImages = [
  upload.array('files', 10), // Allow up to 10 files
  async (req, res) => {
    try {
      const cityId = req.params.id;
      const files = req.files;
      
      console.log('Multiple upload request received for city:', cityId);
      console.log('Files received:', files ? files.length : 0);
      
      if (!files || files.length === 0) {
        return res.status(400).json({ status: 'fail', message: 'No files uploaded' });
      }

      const uploadPromises = [];
      const fileUrls = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const key = `${cityId}/${Date.now()}_${i}_${file.originalname}`;
        
        console.log(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);

        const uploadParams = {
          Bucket: process.env.CLOUDFLARE_R2_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read'
        };

        const uploadPromise = s3.upload(uploadParams).promise().then(() => {
          const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
          fileUrls.push(fileUrl);
          console.log(`File ${i + 1} uploaded successfully: ${fileUrl}`);
          return fileUrl;
        });

        uploadPromises.push(uploadPromise);
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      console.log('All files uploaded successfully');

      // Update City document to add all images
      const updatedCity = await City.findByIdAndUpdate(
        cityId,
        { $push: { images: { $each: fileUrls } } },
        { new: true, runValidators: true }
      );

      if (!updatedCity) {
        console.log('City not found with ID:', cityId);
        return res.status(404).json({ status: 'fail', message: 'City not found' });
      }

      console.log('City updated successfully with', fileUrls.length, 'new images');
      res.status(200).json({ 
        status: 'success', 
        data: updatedCity,
        uploadedCount: fileUrls.length,
        uploadedUrls: fileUrls
      });
    } catch (err) {
      console.error('Multiple upload error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
];

exports.deleteCityImage = async (req, res) => {
  try {
    const cityId = req.params.id;
    const imageUrl = req.body.imageUrl;

    console.log(`Delete request received for city ${cityId}, image URL: ${imageUrl}`);

    if (!imageUrl) {
      return res.status(400).json({ status: 'fail', message: 'Image URL is required' });
    }

    console.log(`Request to delete image from city ${cityId}: ${imageUrl}`);

    // Extract the key from the public URL
    const publicUrlPrefix = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/`;
    if (!imageUrl.startsWith(publicUrlPrefix)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid image URL' });
    }
    const key = imageUrl.replace(publicUrlPrefix, '');

    // Delete the object from R2
    await s3
      .deleteObject({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: key,
      })
      .promise();

    console.log('Image deleted from R2:', key);

    // Remove the image URL from the City's images array
    const updatedCity = await City.findByIdAndUpdate(
      cityId,
      { $pull: { images: imageUrl } },
      { new: true }
    );

    if (!updatedCity) {
      console.log('City not found with ID:', cityId);
      return res.status(404).json({ status: 'fail', message: 'City not found' });
    }

    console.log('City updated, image removed from DB.');
    res.status(200).json({ status: 'success', data: updatedCity });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};



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
        cityOwnerMap[idStr].push({ username: user.username });
      }
    }

    // Step 3: Fetch ALL cities (not just those referenced by users)
    const cities = await City.find({}).sort({ date: 1});
    // Step 4: Attach owners to each city (empty array if no owners)
    const enrichedCities = cities.map(city => {
      const cityObj = city.toObject(); // convert to plain JS object
      cityObj.owners = cityOwnerMap[city._id.toString()] || [];
      return cityObj;
    });
    res.status(200).json(enrichedCities);
  } catch (err) {
    console.error('Error in getAllCities:', err);
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
