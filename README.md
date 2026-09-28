# ReliveRealm

> A full-stack second-hand and refurbished e-commerce platform built with Node.js, Express, MongoDB, JWT authentication, and a responsive frontend.

ReliveRealm is a full-stack e-commerce application for browsing, managing, and maintaining a catalog of pre-owned and refurbished products.

The project implements a secure REST API with user authentication, JWT access and refresh tokens, password hashing, request validation, protected product operations, and a frontend interface that consumes the backend API.

The application is designed around a simple e-commerce workflow:

```text
User
 │
 ▼
ReliveRealm Frontend
 │
 │ HTTP / JSON
 ▼
Express REST API
 │
 ├── Authentication
 │
 ├── Product CRUD
 │
 ├── JWT Authorization
 │
 └── Request Validation
 │
 ▼
MongoDB
```

---

## Features

### Authentication

- User registration
- User login
- Password hashing with bcrypt
- JWT access-token authentication
- Short-lived access tokens
- Refresh tokens
- Refresh-token persistence
- Refresh-token rotation
- HTTP-only refresh-token cookie
- Logout and refresh-token invalidation
- Current-user endpoint
- Protected routes using Bearer authentication
- Generic authentication error messages
- Server-side validation using `express-validator`

### Product Management

- Public product listing
- Public single-product retrieval
- Protected product creation
- Protected product updates
- Protected product deletion
- Product validation
- Product categories
- Product condition
- Pre-owned / refurbished product types
- Product stock management
- Product tags
- Product image URLs

### Frontend

- Responsive e-commerce interface
- Product catalog
- Category filtering
- Product sorting
- Product search
- Shopping cart
- Light/dark theme
- User authentication interface
- Authenticated account menu
- Protected product-management Studio
- Product create/update/delete interface
- MongoDB-backed product data
- Automatic access-token refresh handling

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES Modules)
- Fetch API
- Local Storage
- Responsive design

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Tokens
- express-validator
- cookie-parser
- CORS
- dotenv

## Deployment

- GitHub
- Vercel
- MongoDB Atlas

---

# Project Structure

```text
ReliveRealm/
│
├── index.html
├── login.html
├── register.html
├── admin.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── api.js
│   ├── app.js
│   ├── auth.js
│   ├── config.js
│   ├── admin.js
│   ├── mock-data.js
│   └── ui.js
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   └── validate.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── productRoutes.js
│   │
│   ├── utils/
│   │   └── token.js
│   │
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── productValidators.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

# How the Application Works

## Authentication Flow

ReliveRealm uses two JWT tokens.

### Access Token

The access token is used to authenticate protected API requests.

It is returned by the login endpoint and stored by the frontend.

Protected requests send it using:

```http
Authorization: Bearer <access-token>
```

The access token expires after 15 minutes.

### Refresh Token

The refresh token is valid for 7 days.

It is stored in an HTTP-only cookie so that frontend JavaScript cannot directly access it.

The refresh token is also persisted server-side so it can be revoked.

When an access token expires, the frontend can call:

```http
POST /api/auth/refresh-token
```

The backend verifies the refresh token, rotates it, and returns a new access token.

### Authentication Flow

```text
Login
  │
  ├── Access Token → Frontend
  │
  └── Refresh Token → HTTP-only Cookie
                         │
                         ▼
                    MongoDB User
                         │
                         ▼
                    Token Validation
```

---

# Product Flow

Products are stored in MongoDB.

The frontend does not use hard-coded product data when API mode is enabled.

```text
Frontend
   │
   │ GET /api/products
   ▼
Express API
   │
   ▼
Product Controller
   │
   ▼
Mongoose
   │
   ▼
MongoDB
   │
   ▼
Products
   │
   ▼
Frontend Catalog
```

Product creation, updating, and deletion require authentication.

---

# Environment Variables

The backend requires the following environment variables:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret

REFRESH_TOKEN_SECRET=your_refresh_token_secret

NODE_ENV=development
```

### Variable descriptions

| Variable               | Description                        |
| ---------------------- | ---------------------------------- |
| `PORT`                 | Port used by the Express server    |
| `MONGO_URI`            | MongoDB connection string          |
| `ACCESS_TOKEN_SECRET`  | Secret used to sign access tokens  |
| `REFRESH_TOKEN_SECRET` | Secret used to sign refresh tokens |
| `NODE_ENV`             | Application environment            |

Never commit `.env` to GitHub.

The backend `.gitignore` contains:

```text
node_modules/
.env
```

---

# Local Setup

## Requirements

Install the following before running the project:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB installation
- Git

---

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/reliverealm.git
```

Move into the project:

```bash
cd reliverealm
```

---

# 2. Install Backend Dependencies

Move into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# 3. Configure Environment Variables

Inside the `backend` directory, create:

```text
.env
```

Add:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret

REFRESH_TOKEN_SECRET=your_refresh_token_secret

NODE_ENV=development
```

Replace the placeholder values with your actual MongoDB connection string and JWT secrets.

---

# 4. Start the Backend

For development:

```bash
npm run dev
```

Or:

```bash
npm start
```

The backend should run at:

```text
http://localhost:5000
```

---

# 5. Verify the API

Open:

```text
http://localhost:5000/api
```

Expected response:

```json
{
  "success": true,
  "message": "ReliveRealm API is running"
}
```

Check the database connection:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "api": "running",
  "database": "connected"
}
```

---

# 6. Run the Frontend

The frontend is a static HTML/CSS/JavaScript application.

Use a local HTTP server such as VS Code Live Server.

Do not open the HTML files directly using:

```text
file:///
```

because the application uses JavaScript modules and communicates with the backend API.

For example, using VS Code Live Server:

```text
http://127.0.0.1:5500
```

Make sure the frontend API configuration points to:

```js
export const CONFIG = {
  API_BASE_URL: "http://localhost:5000/api",
  USE_MOCK_DATA: false,
  ACCESS_TOKEN_KEY: "relive_access_token",
  USER_KEY: "relive_user",
  CART_KEY: "relive_cart",
};
```

---

# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Production:

```text
https://YOUR-BACKEND-VERCEL-DOMAIN/api
```

---

# Authentication Endpoints

## Register

Creates a new user account.

```http
POST /api/auth/register
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

The password is never returned.

Registration does not issue authentication tokens.

---

# Login

Authenticates an existing user.

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "ACCESS_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

A refresh token is also issued through an HTTP-only cookie.

---

# Refresh Access Token

Generates a new access token using the refresh-token cookie.

```http
POST /api/auth/refresh-token
```

### Authentication

No Bearer access token is required.

The browser must send the refresh-token cookie.

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "accessToken": "NEW_ACCESS_TOKEN"
}
```

The refresh token is rotated during this process.

---

# Logout

Logs out the authenticated user and invalidates the stored refresh token.

```http
POST /api/auth/logout
```

### Authentication

```http
Authorization: Bearer <access-token>
```

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

The refresh token is removed from the user's database record and the refresh cookie is cleared.

---

# Get Current User

Returns the currently authenticated user.

```http
GET /api/auth/me
```

### Authentication

```http
Authorization: Bearer <access-token>
```

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

# Product Endpoints

## Create Product

Creates a new product.

```http
POST /api/products
```

### Authentication

Required.

```http
Authorization: Bearer <access-token>
```

### Request Body

```json
{
  "name": "Sony WH-1000XM4",
  "description": "Premium wireless noise cancelling headphones.",
  "price": 14999,
  "stock": 5,
  "category": "electronics",
  "condition": "A / Excellent",
  "type": "Pre-owned",
  "image": "https://example.com/product.jpg",
  "tags": ["sony", "headphones", "wireless"]
}
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {}
}
```

---

# Get All Products

Returns all products.

```http
GET /api/products
```

### Authentication

Not required.

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "count": 1,
  "products": []
}
```

---

# Get Product by ID

Returns a single product.

```http
GET /api/products/:id
```

Example:

```http
GET /api/products/65f123456789abcdef123456
```

### Authentication

Not required.

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "product": {}
}
```

Invalid MongoDB IDs are rejected by validation.

---

# Update Product

Updates an existing product.

```http
PUT /api/products/:id
```

### Authentication

Required.

```http
Authorization: Bearer <access-token>
```

### Request Body

```json
{
  "name": "Sony WH-1000XM4",
  "description": "Updated product description.",
  "price": 13999,
  "stock": 8,
  "category": "electronics",
  "condition": "A / Excellent",
  "type": "Pre-owned",
  "image": "https://example.com/product.jpg",
  "tags": ["sony", "headphones", "wireless"]
}
```

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {}
}
```

---

# Delete Product

Deletes an existing product.

```http
DELETE /api/products/:id
```

### Authentication

Required.

```http
Authorization: Bearer <access-token>
```

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

# API Endpoint Summary

| Method | Endpoint                  | Authentication | Purpose              |
| ------ | ------------------------- | -------------: | -------------------- |
| POST   | `/api/auth/register`      |             No | Register a user      |
| POST   | `/api/auth/login`         |             No | Login                |
| POST   | `/api/auth/refresh-token` | Refresh cookie | Refresh access token |
| POST   | `/api/auth/logout`        |            Yes | Logout               |
| GET    | `/api/auth/me`            |            Yes | Get current user     |
| POST   | `/api/products`           |            Yes | Create product       |
| GET    | `/api/products`           |             No | Get all products     |
| GET    | `/api/products/:id`       |             No | Get one product      |
| PUT    | `/api/products/:id`       |            Yes | Update product       |
| DELETE | `/api/products/:id`       |            Yes | Delete product       |
| GET    | `/api/health`             |             No | API/database health  |

---

# Validation and Security

The API validates incoming requests using `express-validator`.

Validation is performed before controller logic.

Examples include:

- Required name validation
- Email format validation
- Password validation
- Password confirmation
- Product name length
- Product description length
- Non-negative product price
- Non-negative integer stock
- Valid product categories
- Valid product condition
- Valid product type
- Valid MongoDB product IDs
- Product image validation
- Product tag validation

---

## Password Security

Passwords are hashed with `bcryptjs` before being stored in MongoDB.

The application uses a minimum of 10 bcrypt salt rounds.

Plain-text passwords are never returned through the API.

---

## JWT Security

JWT secrets are stored in environment variables.

Access and refresh tokens use separate secrets:

```env
ACCESS_TOKEN_SECRET=...

REFRESH_TOKEN_SECRET=...
```

Access tokens expire after 15 minutes.

Refresh tokens expire after 7 days.

---

## Refresh Token Security

Refresh tokens are:

- Stored in an HTTP-only cookie
- Persisted server-side
- Validated against the stored token
- Rotated when refreshed
- Removed during logout
- Rejected when invalid or expired

---

## Protected Routes

Product creation, updating, and deletion require a valid access token.

The authentication middleware:

1. Reads the `Authorization` header.
2. Extracts the Bearer token.
3. Verifies the JWT.
4. Finds the corresponding user.
5. Attaches the authenticated user to `req.user`.
6. Allows the protected controller to execute.

---

# Frontend Authentication Flow

The frontend stores the short-lived access token locally and sends it with protected API requests.

The refresh token remains inside an HTTP-only cookie.

When an access token expires:

```text
Protected Request
       │
       ▼
      401
       │
       ▼
Refresh Token Request
       │
       ▼
New Access Token
       │
       ▼
Retry Original Request
```

If the refresh token is invalid or expired, the frontend clears the session and requires the user to log in again.

---

# Frontend Pages

## Store

```text
/index.html
```

Provides:

- Product catalog
- Category filtering
- Sorting
- Search
- Shopping cart
- Account access
- Theme switching

---

## Login

```text
/login.html
```

Provides user authentication using the backend login API.

---

## Registration

```text
/register.html
```

Creates a new account through the backend registration API.

After successful registration, the user is redirected to the login page.

---

## Studio

```text
/admin.html
```

The Studio is the protected product-management interface.

Authenticated users can:

- View products
- Create products
- Edit products
- Delete products
- View stock status

All write operations communicate with the protected backend API.

---

# Important Security Notes

Never commit:

```text
.env
```

Never put these values directly into frontend code:

```text
MONGO_URI
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
```

MongoDB credentials and JWT secrets belong on the backend only.

Frontend code should only know the public API URL.

---

# API Security Summary

| Area                   | Implementation              |
| ---------------------- | --------------------------- |
| Password storage       | bcrypt                      |
| Password salt rounds   | 10                          |
| Access authentication  | JWT                         |
| Access token lifetime  | 15 minutes                  |
| Refresh token lifetime | 7 days                      |
| Refresh token storage  | HTTP-only cookie + database |
| Refresh rotation       | Enabled                     |
| Logout revocation      | Enabled                     |
| Protected routes       | Bearer authentication       |
| Request validation     | express-validator           |
| Secrets                | Environment variables       |
| Database               | MongoDB Atlas               |
| Cross-origin requests  | CORS with credentials       |

---

# Example User Journey

```text
New User
   │
   ▼
Register
   │
   ▼
Account Created
   │
   ▼
Login
   │
   ├──────────────► Access Token
   │
   └──────────────► Refresh Cookie
   │
   ▼
ReliveRealm Store
   │
   ├── Browse Products
   ├── Search
   ├── Filter
   ├── Sort
   └── Add to Cart
   │
   ▼
Authenticated User
   │
   ▼
Studio
   │
   ├── Create Product
   ├── Update Product
   └── Delete Product
   │
   ▼
MongoDB
```

---

# Future Improvements

Possible future extensions include:

- Product detail pages
- User-specific carts stored on the server
- Orders
- Checkout
- Payment integration
- Product reviews
- Wishlist functionality
- Image upload storage
- Role-based authorization
- Admin-specific roles
- Pagination
- Advanced product search
- Rate limiting
- Automated API tests
- CI/CD checks
- Production monitoring

These features are outside the current authentication and product CRUD implementation.

---

# Conclusion

ReliveRealm demonstrates a complete full-stack e-commerce workflow using a JavaScript frontend, an Express REST API, MongoDB, JWT authentication, secure refresh-token handling, request validation, and protected product CRUD operations.

The project demonstrates:

- REST API design
- Authentication and authorization
- Password security
- JWT lifecycle management
- MongoDB data persistence
- Server-side validation
- Protected CRUD operations
- Frontend/API integration
- Client-side session management
- Git/GitHub workflow
- Vercel deployment

The application can be run locally for development and deployed using GitHub, Vercel, and MongoDB Atlas.
