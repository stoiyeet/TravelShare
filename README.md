# To run the application, please follow these steps:

## Environment Setup

Before running the application, create a `.env` file in the project root with the following variables:

```env
# JWT secret key for signing authentication tokens
JWT_SECRET=

# MongoDB connection URI
MONGODB_URI=

# Google Geocoding API endpoint (e.g., https://maps.googleapis.com/maps/api/geocode/json?key=YOUR_API_KEY)
GOOGLE_GEOCODING_URI=

# Cloudflare R2 storage configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=       # e.g., https://<account_id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=     # Public base URL for accessing images, e.g., https://cdn.example.com/images
```

### Running the Frontend
```bash
npm install
npm run dev
```

### Running the Backend
```bash
cd server
npm install
npm start
```

## Tech Stack

### 🌐 Frontend
- ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React** — component-based UI
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite** — fast development build tool
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS** — utility-first modern styling
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white) **React Router** — client-side routing


### 🔗 Backend
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) **Node.js** — JavaScript runtime
- ![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) **Express.js** — web framework for API routes
- ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white) **Mongoose** — MongoDB object modeling

### 🗄️ Database
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) **MongoDB Atlas** — cloud-hosted NoSQL database

### ☁️ Cloud Storage
- ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat&logo=cloudflare&logoColor=white) **Cloudflare R2** — object storage (S3-compatible)

### 🌍 APIs & External Services
- ![Google Maps](https://img.shields.io/badge/Google_Geocoding_API-4285F4?style=flat&logo=googlemaps&logoColor=white) **Google Geocoding API** — location services and geocoding
- ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) **JWT (JSON Web Tokens)** — secure user authentication

### 🧩 Dev Tools
- ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) **ESLint & Prettier** — code linting and formatting
- ![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=flat&logo=dotenv&logoColor=black) **dotenv** — environment variable management
- ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) **Git** — version control
- ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white) **GitHub** — code hosting and collaboration

### demoVideo
[Watch on Youtube!](https://youtu.be/Dva41xFYo_8)

Make sure to update your viewing quality to the highest possible setting!