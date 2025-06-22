// Test script for image upload functionality
// Run this with: node test-upload.js

const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  const SERVER_URL = "http://localhost:9000";
  
  // You'll need to replace these with actual values
  const CITY_ID = "YOUR_CITY_ID_HERE"; // Replace with an actual city ID from your database
  const IMAGE_PATH = "C:/Users/MarkKogan/Downloads/IMG_1411.jpg"; // The image you mentioned
  
  console.log('Testing image upload...');
  console.log('City ID:', CITY_ID);
  console.log('Image path:', IMAGE_PATH);
  
  try {
    // Check if image file exists
    if (!fs.existsSync(IMAGE_PATH)) {
      console.error('Image file not found at:', IMAGE_PATH);
      return;
    }
    
    // Read the image file
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const fileName = path.basename(IMAGE_PATH);
    
    // Create FormData equivalent for Node.js
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: fileName,
      contentType: 'image/jpeg'
    });
    
    // Make the upload request
    const fetch = require('node-fetch');
    const response = await fetch(`${SERVER_URL}/api/cities/${CITY_ID}/uploadImage`, {
      method: 'POST',
      body: formData,
      headers: {
        // Include your auth cookie here if needed
        // 'Cookie': 'your-auth-cookie=value'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Upload failed!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error during upload:', error.message);
  }
}

// Instructions for manual testing
console.log(`
🧪 MANUAL TESTING INSTRUCTIONS:

1. First, make sure your server is running:
   cd server && npm start

2. Create a city in your app and note its ID from the database

3. Update this script with:
   - CITY_ID: Replace with actual city ID
   - IMAGE_PATH: Confirm the path to your test image

4. Install required dependencies:
   npm install form-data node-fetch

5. Run this test:
   node test-upload.js

📝 DEBUGGING CHECKLIST:

✓ Server is running on port 9000
✓ MongoDB is connected
✓ City exists in database
✓ Image file exists at specified path
✓ Cloudflare R2 credentials are correct in .env
✓ User is authenticated (if testing via browser)

🔍 CHECK SERVER LOGS:
The server now includes detailed console.log statements to help debug:
- Upload request received
- File processing
- R2 upload status
- Database update status
`);

// Uncomment the line below to run the test
// testImageUpload();
