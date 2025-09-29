# Authentication System

This is a complete authentication system extracted from the chai-backend project. It provides user registration, login, logout, password management, and profile management functionality.

## Features

- **User Registration** - Register new users with avatar and cover image upload
- **User Login** - Login with email/username and password
- **JWT Authentication** - Access and refresh token based authentication
- **Password Management** - Change password functionality
- **Profile Management** - Update account details, avatar, and cover image
- **User Profile** - Get current user and channel profile information
- **File Upload** - Avatar and cover image upload using Cloudinary
- **Security** - Password hashing with bcrypt, JWT token verification

## Project Structure

```
authentication/
├── src/
│   ├── controllers/
│   │   └── user.controller.js      # User authentication controllers
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification middleware
│   │   └── multer.middleware.js    # File upload middleware
│   ├── models/
│   │   └── user.model.js           # User schema and methods
│   ├── routes/
│   │   └── user.routes.js          # User authentication routes
│   ├── utils/
│   │   ├── ApiError.js             # Custom error class
│   │   ├── ApiResponse.js          # Custom response class
│   │   ├── asyncHandler.js         # Async error handler
│   │   └── cloudinary.js           # Cloudinary upload utility
│   ├── db/
│   │   └── index.js                # Database connection
│   ├── app.js                      # Express app configuration
│   ├── index.js                    # Server entry point
│   └── constants.js                # Application constants
├── public/
│   └── temp/                       # Temporary file storage
├── package.json                    # Dependencies and scripts
├── env.example                     # Environment variables example
└── README.md                       # This file
```

## Installation

1. Clone or copy this authentication folder
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `env.example` to `.env`
   - Fill in your MongoDB URI, JWT secrets, and Cloudinary credentials

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes (`/api/v1/users`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user (requires authentication)
- `POST /refresh-token` - Refresh access token
- `POST /change-password` - Change password (requires authentication)
- `GET /current-user` - Get current user (requires authentication)
- `PATCH /update-account` - Update account details (requires authentication)
- `PATCH /avatar` - Update user avatar (requires authentication)
- `PATCH /cover-image` - Update cover image (requires authentication)
- `GET /c/:username` - Get user channel profile (requires authentication)
- `GET /history` - Get watch history (requires authentication)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# JWT Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=8000

# CORS
CORS_ORIGIN=http://localhost:3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB object modeling
- **jsonwebtoken** - JWT token handling
- **bcrypt** - Password hashing
- **multer** - File upload handling
- **cloudinary** - Cloud file storage
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Cookie parsing
- **dotenv** - Environment variable loading

## Usage

1. Start your MongoDB server
2. Set up Cloudinary account for file uploads
3. Configure environment variables
4. Run `npm run dev` to start the server
5. The server will be available at `http://localhost:8000`

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Access and refresh token system
- Secure cookie handling
- Input validation and sanitization
- File upload security with Cloudinary

This authentication system is production-ready and can be integrated into any Node.js application requiring user authentication.
