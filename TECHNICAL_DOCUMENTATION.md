# Movie Booking System - Technical Documentation

## Executive Summary

The Movie Booking System is a comprehensive full-stack web application designed to facilitate online movie ticket booking with real-time seat selection, secure payment processing, and administrative management capabilities. Built using modern web technologies including Next.js 16, MongoDB, Stripe, and Cloudinary, the system provides a seamless experience for both end-users and administrators.

**Project Repository**: https://github.com/shankerpangeni/movie-booking-system

**Key Highlights:**
- Real-time seat reservation with 5-minute temporary holds
- Secure payment processing via Stripe
- Cloud-based media management with Cloudinary
- Role-based access control (User/Admin)
- Responsive design for all devices
- RESTful API architecture

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [Features & Functionality](#features--functionality)
5. [API Documentation](#api-documentation)
6. [Security Implementation](#security-implementation)
7. [Payment Integration](#payment-integration)
8. [Deployment Architecture](#deployment-architecture)
9. [Installation Guide](#installation-guide)
10. [Testing & Quality Assurance](#testing--quality-assurance)

---

## 1. System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React/Next.js Frontend]
    end
    
    subgraph "Application Layer"
        C[Next.js API Routes]
        D[Controllers]
        E[Middleware]
    end
    
    subgraph "Data Layer"
        F[MongoDB Atlas]
        G[Mongoose ODM]
    end
    
    subgraph "External Services"
        H[Stripe Payment Gateway]
        I[Cloudinary Media Storage]
    end
    
    A --> B
    B --> C
    C --> E
    E --> D
    D --> G
    G --> F
    D --> H
    D --> I
```

### Application Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Routes
    participant DB as MongoDB
    participant S as Stripe
    
    U->>F: Browse Movies
    F->>API: GET /api/movies
    API->>DB: Query Movies
    DB-->>API: Return Movies
    API-->>F: Movies Data
    F-->>U: Display Movies
    
    U->>F: Select Showtime & Seats
    F->>API: POST /api/seats/reserve
    API->>DB: Create Temporary Reservation
    DB-->>API: Reservation Confirmed
    API-->>F: Seats Reserved (5 min)
    
    U->>F: Proceed to Payment
    F->>API: POST /api/payment/create-intent
    API->>S: Create Payment Intent
    S-->>API: Client Secret
    API-->>F: Payment Intent
    
    U->>F: Enter Card Details
    F->>S: Process Payment
    S-->>F: Payment Success
    
    F->>API: POST /api/bookings
    API->>DB: Create Booking
    DB-->>API: Booking Created
    API-->>F: Booking Confirmation
    F-->>U: Show QR Code & Details
```

### Component Architecture

The application follows a modular architecture with clear separation of concerns:

**Frontend Components:**
- Page Components (App Router)
- Reusable UI Components (Navbar, Footer, Loading, etc.)
- Redux Store for State Management
- Client-side API Integration

**Backend Components:**
- API Routes (Next.js Route Handlers)
- Controllers (Business Logic)
- Models (Data Schemas)
- Middleware (Authentication, Error Handling)
- Utilities (Database Connection, Cloudinary Config)

---

## 2. Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.3 | React framework with SSR, routing, and API routes |
| React | 19.2.0 | UI library for building components |
| Tailwind CSS | 4.0 | Utility-first CSS framework |
| Redux Toolkit | 2.10.1 | State management |
| Axios | 1.13.2 | HTTP client for API requests |
| React Icons | 5.5.0 | Icon library |
| React Toastify | 11.0.5 | Toast notifications |
| Stripe React | 5.4.0 | Payment UI components |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.16.0 | JavaScript runtime |
| MongoDB | 8.19.3 | NoSQL database |
| Mongoose | 8.19.3 | MongoDB ODM |
| JWT | 9.0.2 | Authentication tokens |
| bcryptjs | 3.0.3 | Password hashing |
| Stripe | 20.0.0 | Payment processing |
| Cloudinary | 1.41.3 | Media storage and CDN |
| Multer | 2.0.2 | File upload handling |

### Cloud Services

| Service | Purpose |
|---------|---------|
| Vercel | Application hosting and deployment |
| MongoDB Atlas | Managed MongoDB database |
| Cloudinary | Image and video storage/optimization |
| Stripe | Payment gateway and processing |

---

## 3. Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    USER ||--o{ SEAT_RESERVATION : reserves
    MOVIE ||--o{ SHOWTIME : "shown in"
    HALL ||--o{ SCREEN : contains
    HALL ||--o{ SHOWTIME : hosts
    SCREEN ||--o{ SHOWTIME : displays
    SHOWTIME ||--o{ BOOKING : "booked for"
    SHOWTIME ||--o{ SEAT_RESERVATION : "reserved for"
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        string profileImage
        datetime createdAt
        datetime updatedAt
    }
    
    MOVIE {
        ObjectId _id PK
        string title
        string description
        number duration
        date releaseDate
        array genre
        string coverImage
        string poster
        array cast
        number rating
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    HALL {
        ObjectId _id PK
        string name
        string address
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    SCREEN {
        ObjectId _id PK
        string name
        ObjectId hall FK
        array layout
        datetime createdAt
        datetime updatedAt
    }
    
    SHOWTIME {
        ObjectId _id PK
        ObjectId hall FK
        ObjectId screen FK
        ObjectId movie FK
        datetime startTime
        datetime endTime
        datetime createdAt
        datetime updatedAt
    }
    
    BOOKING {
        ObjectId _id PK
        string bookingReference UK
        ObjectId showtime FK
        ObjectId user FK
        array seats
        string paymentStatus
        string paymentIntentId
        datetime createdAt
        datetime updatedAt
    }
    
    SEAT_RESERVATION {
        ObjectId _id PK
        ObjectId showtime FK
        string seatName
        ObjectId user FK
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }
```

### Schema Details

#### User Schema
```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, hashed with bcrypt),
  role: String (enum: ["user", "admin"], default: "user"),
  profileImage: String (Cloudinary URL),
  timestamps: true
}
```

#### Movie Schema
```javascript
{
  title: String (required),
  description: String,
  duration: Number (required, in minutes),
  releaseDate: Date,
  genre: [String] (array of genres),
  coverImage: String (Cloudinary URL),
  poster: String (Cloudinary URL),
  cast: [{
    name: String (required),
    role: String,
    image: String (Cloudinary URL)
  }],
  rating: Number (min: 0, max: 10),
  status: String (enum: ["now-showing", "upcoming"], default: "now-showing"),
  timestamps: true
}
```

#### Hall Schema
```javascript
{
  name: String (required, trimmed),
  address: String (required),
  description: String,
  timestamps: true
}
```

#### Screen Schema
```javascript
{
  name: String (required),
  hall: ObjectId (ref: "Hall", required),
  layout: [{
    seatName: String (required, e.g., "A1"),
    type: String (enum: ["regular", "premium", "vip"], default: "regular"),
    price: Number (required)
  }],
  timestamps: true
}
```

#### ShowTime Schema
```javascript
{
  hall: ObjectId (ref: "Hall", required),
  screen: ObjectId (ref: "Screen", required),
  movie: ObjectId (ref: "Movie", required),
  startTime: Date (required),
  endTime: Date (required),
  timestamps: true
}
```

#### Booking Schema
```javascript
{
  bookingReference: String (required, unique, auto-generated: "BK-YYYYMMDD-RANDOM"),
  showtime: ObjectId (ref: "ShowTime", required),
  user: ObjectId (ref: "User", required),
  seats: [{
    seatName: String (required),
    price: Number (required)
  }],
  paymentStatus: String (enum: ["paid", "pending", "failed"], default: "pending"),
  paymentIntentId: String (Stripe payment intent ID),
  timestamps: true
}
```

#### SeatReservation Schema
```javascript
{
  showtime: ObjectId (ref: "ShowTime", required),
  seatName: String (required),
  user: ObjectId (ref: "User", required),
  expiresAt: Date (required, TTL index for auto-deletion),
  timestamps: true
}
```

**Note:** The `SeatReservation` collection uses a TTL (Time To Live) index on `expiresAt` to automatically delete expired reservations after 5 minutes.

### Database Indexes

- **User**: `email` (unique)
- **Booking**: `bookingReference` (unique)
- **SeatReservation**: `expiresAt` (TTL index), compound index on `(showtime, seatName)`

---

## 4. Features & Functionality

### 4.1 User Features

#### Authentication & Authorization
- **User Registration**: Email-based registration with password hashing
- **Login/Logout**: JWT-based authentication with HTTP-only cookies
- **Profile Management**: Update name, email, and profile picture
- **Role-based Access**: Separate user and admin roles

#### Movie Browsing
- **Homepage**: Featured movies with cover images
- **Movies Page**: Grid view of all movies with filters
- **Movie Details**: Comprehensive information including cast, genre, rating, duration
- **Status Filtering**: View "Now Showing" or "Upcoming" movies

#### Seat Selection & Booking
- **Interactive Seat Map**: Visual representation of screen layout
- **Seat Types**: Regular, Premium, and VIP seats with different pricing
- **Real-time Availability**: Live updates every 5 seconds
- **Temporary Reservation**: 5-minute hold on selected seats
- **Countdown Timer**: Visual countdown for reservation expiry
- **Multi-seat Selection**: Select multiple seats (up to 10)
- **Seat Color Coding**:
  - Green: Available
  - Yellow: Reserved by others
  - Blue: Selected by current user
  - Red: Permanently booked

#### Payment & Confirmation
- **Stripe Integration**: Secure card payment processing
- **Payment Intent**: Pre-authorization before payment
- **Test Mode Support**: Use test cards for development
- **Booking Confirmation**: Unique booking reference (BK-YYYYMMDD-RANDOM)
- **QR Code Generation**: Scannable QR code for ticket verification
- **Email Confirmation**: Booking details sent to user email

#### Booking History
- **View All Bookings**: List of all user bookings
- **Booking Details**: Movie, showtime, seats, payment status
- **QR Code Access**: View QR code for each booking

### 4.2 Admin Features

#### Dashboard
- **Statistics Overview**: Total bookings, revenue, active movies
- **Recent Bookings**: Latest booking transactions
- **Revenue Charts**: Visual representation of earnings

#### Movie Management
- **Add Movies**: Create new movie entries with details
- **Edit Movies**: Update movie information
- **Delete Movies**: Remove movies from system
- **Cast Management**: Add/remove cast members with images
- **Image Upload**: Upload posters and cover images to Cloudinary
- **Status Control**: Mark movies as "Now Showing" or "Upcoming"

#### Hall Management
- **Create Halls**: Add new cinema halls
- **Edit Halls**: Update hall information
- **Delete Halls**: Remove halls (if no associated screens)

#### Screen Management
- **Create Screens**: Add screens to halls
- **Custom Layouts**: Define seat arrangements
- **Seat Configuration**: Set seat names, types, and prices
- **Edit Screens**: Modify screen details
- **Delete Screens**: Remove screens (if no active showtimes)

#### Showtime Management
- **Schedule Shows**: Create showtimes for movies
- **Time Validation**: Prevent overlapping showtimes
- **Hall & Screen Selection**: Assign shows to specific locations
- **Delete Shows**: Cancel scheduled showtimes

### 4.3 Technical Features

#### Real-time Updates
- **Polling Mechanism**: Fetch seat availability every 5 seconds
- **Optimistic UI Updates**: Immediate feedback on user actions
- **State Synchronization**: Redux store keeps UI in sync

#### Image Optimization
- **Cloudinary Integration**: Automatic image optimization and CDN delivery
- **Next.js Image Component**: Lazy loading and responsive images
- **Folder Structure**: Organized storage (movies/, profiles/, cast/)

#### Performance Optimization
- **Server-side Rendering**: Fast initial page loads
- **Static Generation**: Pre-rendered pages where possible
- **Code Splitting**: Automatic code splitting by Next.js
- **Caching**: Browser and CDN caching for static assets

#### Error Handling
- **Try-Catch Blocks**: Comprehensive error handling in API routes
- **User-friendly Messages**: Toast notifications for errors
- **Validation**: Input validation on both client and server
- **Logging**: Server-side error logging for debugging

---

## 5. API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profileImage": "https://res.cloudinary.com/..."
  }
}
```
**Note:** JWT token is set as HTTP-only cookie.

#### GET /api/auth/me
Get current authenticated user details.

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profileImage": "https://res.cloudinary.com/..."
  }
}
```

#### PUT /api/auth/me
Update user profile (supports multipart/form-data for image upload).

**Request Body (FormData):**
```
name: "John Updated"
email: "john.updated@example.com"
profileImage: <File>
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### POST /api/auth/logout
Logout user and clear authentication cookie.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### Movie Endpoints

#### GET /api/movies
Get all movies or filter by status.

**Query Parameters:**
- `status` (optional): "now-showing" | "upcoming"

**Response (200):**
```json
{
  "movies": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Inception",
      "description": "A mind-bending thriller...",
      "duration": 148,
      "releaseDate": "2010-07-16T00:00:00.000Z",
      "genre": ["Action", "Sci-Fi", "Thriller"],
      "coverImage": "https://res.cloudinary.com/...",
      "poster": "https://res.cloudinary.com/...",
      "cast": [
        {
          "name": "Leonardo DiCaprio",
          "role": "Cobb",
          "image": "https://res.cloudinary.com/..."
        }
      ],
      "rating": 8.8,
      "status": "now-showing"
    }
  ]
}
```

#### GET /api/movies?id={movieId}
Get single movie by ID.

**Response (200):**
```json
{
  "movie": { ... }
}
```

#### POST /api/movies (Admin Only)
Create a new movie (supports multipart/form-data).

**Request Body (FormData):**
```
title: "Inception"
description: "A mind-bending thriller..."
duration: 148
releaseDate: "2010-07-16"
genre: ["Action", "Sci-Fi"]
rating: 8.8
status: "now-showing"
coverImage: <File>
poster: <File>
cast: JSON.stringify([{name: "Leonardo DiCaprio", role: "Cobb"}])
```

**Response (201):**
```json
{
  "message": "Movie created successfully",
  "movie": { ... }
}
```

#### PUT /api/movies?id={movieId} (Admin Only)
Update existing movie.

**Response (200):**
```json
{
  "message": "Movie updated successfully",
  "movie": { ... }
}
```

#### DELETE /api/movies?id={movieId} (Admin Only)
Delete a movie.

**Response (200):**
```json
{
  "message": "Movie deleted successfully"
}
```

### Hall Endpoints

#### GET /api/halls
Get all halls.

**Response (200):**
```json
{
  "halls": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Cineplex Downtown",
      "address": "123 Main St, City",
      "description": "Premium cinema experience"
    }
  ]
}
```

#### POST /api/halls (Admin Only)
Create a new hall.

**Request Body:**
```json
{
  "name": "Cineplex Downtown",
  "address": "123 Main St, City",
  "description": "Premium cinema experience"
}
```

**Response (201):**
```json
{
  "message": "Hall created successfully",
  "hall": { ... }
}
```

### Screen Endpoints

#### GET /api/screens
Get all screens or filter by hall.

**Query Parameters:**
- `hallId` (optional): Filter screens by hall ID

**Response (200):**
```json
{
  "screens": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Screen 1",
      "hall": { ... },
      "layout": [
        {
          "seatName": "A1",
          "type": "regular",
          "price": 10
        },
        {
          "seatName": "A2",
          "type": "premium",
          "price": 15
        }
      ]
    }
  ]
}
```

#### POST /api/screens (Admin Only)
Create a new screen with seat layout.

**Request Body:**
```json
{
  "name": "Screen 1",
  "hall": "60f7b3b3b3b3b3b3b3b3b3b3",
  "layout": [
    { "seatName": "A1", "type": "regular", "price": 10 },
    { "seatName": "A2", "type": "premium", "price": 15 }
  ]
}
```

**Response (201):**
```json
{
  "message": "Screen created successfully",
  "screen": { ... }
}
```

### Showtime Endpoints

#### GET /api/shows
Get all showtimes with populated movie, hall, and screen details.

**Response (200):**
```json
{
  "shows": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "movie": { ... },
      "hall": { ... },
      "screen": { ... },
      "startTime": "2024-01-15T18:00:00.000Z",
      "endTime": "2024-01-15T20:30:00.000Z"
    }
  ]
}
```

#### GET /api/shows?id={showId}
Get single showtime with seat availability.

**Response (200):**
```json
{
  "show": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "movie": { ... },
    "hall": { ... },
    "screen": {
      "layout": [
        {
          "seatName": "A1",
          "type": "regular",
          "price": 10,
          "isBooked": false,
          "isReserved": false
        }
      ]
    },
    "startTime": "2024-01-15T18:00:00.000Z",
    "endTime": "2024-01-15T20:30:00.000Z"
  }
}
```

#### POST /api/shows (Admin Only)
Create a new showtime.

**Request Body:**
```json
{
  "movie": "60f7b3b3b3b3b3b3b3b3b3b3",
  "hall": "60f7b3b3b3b3b3b3b3b3b3b3",
  "screen": "60f7b3b3b3b3b3b3b3b3b3b3",
  "startTime": "2024-01-15T18:00:00.000Z",
  "endTime": "2024-01-15T20:30:00.000Z"
}
```

**Response (201):**
```json
{
  "message": "Showtime created successfully",
  "show": { ... }
}
```

### Seat Reservation Endpoints

#### POST /api/seats/reserve
Temporarily reserve seats for 5 minutes.

**Request Body:**
```json
{
  "showtime": "60f7b3b3b3b3b3b3b3b3b3b3",
  "seats": ["A1", "A2", "A3"]
}
```

**Response (200):**
```json
{
  "message": "Seats reserved successfully",
  "expiresAt": "2024-01-15T18:05:00.000Z"
}
```

#### POST /api/seats/release
Release temporarily reserved seats.

**Request Body:**
```json
{
  "showtime": "60f7b3b3b3b3b3b3b3b3b3b3",
  "seats": ["A1", "A2"]
}
```

**Response (200):**
```json
{
  "message": "Seats released successfully"
}
```

### Booking Endpoints

#### GET /api/bookings
Get all bookings for authenticated user.

**Response (200):**
```json
{
  "bookings": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "bookingReference": "BK-20240115-ABC123",
      "showtime": {
        "movie": { ... },
        "hall": { ... },
        "screen": { ... },
        "startTime": "2024-01-15T18:00:00.000Z"
      },
      "seats": [
        { "seatName": "A1", "price": 10 },
        { "seatName": "A2", "price": 10 }
      ],
      "paymentStatus": "paid",
      "createdAt": "2024-01-15T17:30:00.000Z"
    }
  ]
}
```

#### POST /api/bookings
Create a new booking after successful payment.

**Request Body:**
```json
{
  "showtime": "60f7b3b3b3b3b3b3b3b3b3b3",
  "seats": [
    { "seatName": "A1", "price": 10 },
    { "seatName": "A2", "price": 10 }
  ],
  "paymentIntentId": "pi_1234567890"
}
```

**Response (201):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "bookingReference": "BK-20240115-ABC123",
    ...
  }
}
```

### Payment Endpoints

#### POST /api/payment/create-intent
Create a Stripe payment intent.

**Request Body:**
```json
{
  "amount": 2000,
  "showtime": "60f7b3b3b3b3b3b3b3b3b3b3",
  "seats": ["A1", "A2"]
}
```

**Response (200):**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefg"
}
```

#### POST /api/payment/webhook
Stripe webhook endpoint for payment events.

**Headers:**
```
stripe-signature: <webhook_signature>
```

**Note:** This endpoint is called by Stripe, not the frontend.

---

## 6. Security Implementation

### Authentication & Authorization

#### JWT-based Authentication
- **Token Generation**: JWT tokens created upon successful login
- **HTTP-only Cookies**: Tokens stored in secure, HTTP-only cookies
- **Token Expiration**: Configurable expiration time (default: 7 days)
- **Token Verification**: Middleware validates tokens on protected routes

#### Password Security
- **Hashing**: bcryptjs with salt rounds (default: 10)
- **No Plain Text Storage**: Passwords never stored in plain text
- **Password Validation**: Minimum length requirements

#### Role-based Access Control (RBAC)
- **User Role**: Default role for registered users
- **Admin Role**: Elevated privileges for management tasks
- **Middleware Protection**: Admin-only routes protected by auth middleware
- **Frontend Guards**: UI elements hidden based on user role

### API Security

#### Input Validation
- **Request Body Validation**: Validate all incoming data
- **Type Checking**: Ensure correct data types
- **Sanitization**: Remove potentially harmful characters
- **Length Limits**: Prevent buffer overflow attacks

#### CORS Configuration
- **Origin Whitelist**: Only allow requests from trusted origins
- **Credentials**: Allow credentials for cookie-based auth
- **Methods**: Restrict to necessary HTTP methods

#### Rate Limiting
- **Request Throttling**: Limit requests per IP address
- **Brute Force Protection**: Prevent password guessing attacks
- **DDoS Mitigation**: Protect against denial-of-service attacks

### Data Security

#### Database Security
- **Connection String**: Stored in environment variables
- **IP Whitelist**: MongoDB Atlas network access control
- **Encryption**: Data encrypted at rest and in transit
- **Backup**: Regular automated backups

#### File Upload Security
- **File Type Validation**: Only allow image files
- **File Size Limits**: Prevent large file uploads
- **Cloudinary Validation**: Server-side validation before upload
- **Signed URLs**: Use signed URLs for secure access

### Payment Security

#### PCI Compliance
- **Stripe Integration**: PCI-compliant payment processing
- **No Card Storage**: Card details never touch our servers
- **Tokenization**: Stripe handles card tokenization
- **3D Secure**: Support for 3D Secure authentication

#### Webhook Security
- **Signature Verification**: Verify Stripe webhook signatures
- **Event Validation**: Validate event types and data
- **Idempotency**: Handle duplicate webhook events

---

## 7. Payment Integration

### Stripe Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant S as Stripe
    participant DB as Database
    
    U->>F: Select Seats & Proceed
    F->>API: POST /api/payment/create-intent
    API->>S: Create Payment Intent
    S-->>API: Return Client Secret
    API-->>F: Client Secret
    
    F->>F: Load Stripe Elements
    U->>F: Enter Card Details
    F->>S: Confirm Payment
    S->>S: Process Payment
    S-->>F: Payment Success
    
    S->>API: Webhook: payment_intent.succeeded
    API->>DB: Update Booking Status
    
    F->>API: POST /api/bookings
    API->>DB: Create Booking
    API->>DB: Delete Seat Reservations
    DB-->>API: Booking Created
    API-->>F: Booking Confirmation
    F-->>U: Show Success & QR Code
```

### Payment Intent Creation

**Backend Logic:**
1. Validate user authentication
2. Verify seat availability
3. Calculate total amount
4. Create Stripe payment intent
5. Return client secret to frontend

**Frontend Logic:**
1. Load Stripe.js library
2. Initialize Stripe Elements
3. Display card input form
4. Handle payment confirmation
5. Show success/error messages

### Webhook Handling

**Events Handled:**
- `payment_intent.succeeded`: Update booking status to "paid"
- `payment_intent.payment_failed`: Update booking status to "failed"

**Security Measures:**
- Verify webhook signature using Stripe secret
- Validate event type and data structure
- Implement idempotency to handle duplicate events
- Log all webhook events for audit trail

### Test Mode

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`

**Test Details:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 8. Deployment Architecture

### Vercel Deployment

```mermaid
graph LR
    A[GitHub Repository] -->|Push| B[Vercel Build]
    B -->|Deploy| C[Vercel Edge Network]
    C -->|Serve| D[Global CDN]
    D -->|Deliver| E[End Users]
    
    C -->|API Calls| F[Serverless Functions]
    F -->|Query| G[MongoDB Atlas]
    F -->|Upload| H[Cloudinary]
    F -->|Payment| I[Stripe]
```

### Environment Configuration

**Production Environment Variables:**
```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/movie-booking-system

# Authentication
JWT_SECRET=production-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

### Deployment Process

1. **Code Push**: Developer pushes code to GitHub
2. **Automatic Build**: Vercel detects changes and triggers build
3. **Build Process**:
   - Install dependencies
   - Run Next.js build
   - Generate static pages
   - Create serverless functions
4. **Deployment**: Deploy to Vercel edge network
5. **DNS Update**: Update DNS to point to new deployment
6. **Health Check**: Verify deployment is healthy

### Serverless Functions

**Characteristics:**
- Auto-scaling based on demand
- Pay-per-execution pricing
- 10-second timeout (free tier)
- 50MB deployment size limit
- Stateless execution

**Optimization:**
- Minimize cold start time
- Reuse database connections
- Implement caching where possible
- Use edge functions for static content

---

## 9. Installation Guide

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- MongoDB Atlas account
- Cloudinary account
- Stripe account
- Git

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone https://github.com/shankerpangeni/movie-booking-system.git
cd movie-booking-system/fullstacknextjs
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free M0 tier available)
3. Create database user:
   - Go to **Database Access**
   - Click **Add New Database User**
   - Set username and password
   - Grant "Read and write to any database"
4. Configure network access:
   - Go to **Network Access**
   - Click **Add IP Address**
   - Select **Allow Access from Anywhere** (0.0.0.0/0)
5. Get connection string:
   - Go to **Database** → **Connect**
   - Choose **Drivers**
   - Copy connection string
   - Replace `<password>` with your password
   - Add database name: `/movie-booking-system`

#### 4. Cloudinary Setup

1. Sign up at https://cloudinary.com/
2. Go to **Dashboard**
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Create upload presets (optional):
   - Go to **Settings** → **Upload**
   - Create presets for movies, profiles, cast

#### 5. Stripe Setup

1. Create account at https://stripe.com/
2. Go to **Developers** → **API Keys**
3. Copy test mode keys:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
4. For webhooks (production):
   - Go to **Developers** → **Webhooks**
   - Add endpoint: `https://your-domain.vercel.app/api/payment/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

#### 6. Environment Variables

Create `.env.local` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/movie-booking-system?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 7. Run Development Server

```bash
npm run dev
```

Access at http://localhost:3000

#### 8. Create Admin User

Option 1 - Using script:
```bash
node createAdmin.js
```

Option 2 - Manually in MongoDB:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

#### 9. Production Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

---

## 10. Testing & Quality Assurance

### Testing Strategy

#### Unit Testing
- **Controllers**: Test business logic in isolation
- **Models**: Validate schema constraints
- **Utilities**: Test helper functions

#### Integration Testing
- **API Routes**: Test complete request/response cycle
- **Database Operations**: Verify CRUD operations
- **External Services**: Mock Stripe and Cloudinary

#### End-to-End Testing
- **User Flows**: Complete booking process
- **Admin Workflows**: Movie and showtime management
- **Payment Processing**: Full payment integration

### Manual Testing Checklist

#### User Registration & Login
- [ ] Register with valid email and password
- [ ] Register with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should fail)
- [ ] Logout successfully
- [ ] Access protected routes without authentication (should redirect)

#### Movie Browsing
- [ ] View all movies on homepage
- [ ] Filter movies by status (now-showing/upcoming)
- [ ] View movie details page
- [ ] View cast information
- [ ] Responsive design on mobile devices

#### Seat Selection & Booking
- [ ] Select showtime for a movie
- [ ] View seat map with availability
- [ ] Select multiple seats
- [ ] See real-time updates (other users' selections)
- [ ] Reservation countdown timer works
- [ ] Seats auto-release after 5 minutes
- [ ] Cannot select already booked seats
- [ ] Cannot select more than 10 seats

#### Payment Processing
- [ ] Payment form loads correctly
- [ ] Enter valid card details (test mode)
- [ ] Payment succeeds with test card
- [ ] Payment fails with decline card
- [ ] Booking created after successful payment
- [ ] Seats permanently booked after payment
- [ ] QR code generated for booking

#### Profile Management
- [ ] View user profile
- [ ] Update name and email
- [ ] Upload profile picture
- [ ] View booking history
- [ ] Access individual booking details

#### Admin Features
- [ ] Access admin dashboard (admin only)
- [ ] Create new movie with images
- [ ] Edit existing movie
- [ ] Delete movie
- [ ] Create hall
- [ ] Create screen with seat layout
- [ ] Create showtime
- [ ] View all bookings and revenue

### Performance Testing

#### Metrics to Monitor
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Image Load Time**: < 2 seconds (with CDN)

#### Load Testing
- Concurrent users: Test with 100+ simultaneous users
- Seat reservation conflicts: Multiple users selecting same seats
- Payment processing: Handle multiple simultaneous payments
- Database connections: Monitor connection pool usage

### Security Testing

#### Vulnerability Checks
- [ ] SQL Injection (N/A - using MongoDB)
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Authentication bypass attempts
- [ ] Authorization bypass (user accessing admin routes)
- [ ] File upload vulnerabilities
- [ ] API rate limiting

#### Penetration Testing
- Test with OWASP ZAP or similar tools
- Verify JWT token security
- Test payment webhook signature verification
- Check for exposed sensitive data in responses

---

## Conclusion

The Movie Booking System is a production-ready application that demonstrates modern web development practices, including:

- **Scalable Architecture**: Serverless deployment with auto-scaling
- **Security Best Practices**: JWT authentication, encrypted data, PCI-compliant payments
- **Real-time Features**: Live seat availability updates
- **Cloud Integration**: Cloudinary for media, MongoDB Atlas for database, Stripe for payments
- **User Experience**: Responsive design, intuitive interface, real-time feedback

### Future Enhancements

1. **Email Notifications**: Send booking confirmations via email
2. **SMS Notifications**: Send booking reminders via SMS
3. **Reviews & Ratings**: Allow users to rate and review movies
4. **Loyalty Program**: Implement points and rewards system
5. **Mobile App**: Develop native iOS and Android apps
6. **Analytics Dashboard**: Advanced analytics for admins
7. **Multi-language Support**: Internationalization (i18n)
8. **Social Login**: OAuth integration (Google, Facebook)
9. **Seat Recommendations**: AI-powered seat suggestions
10. **Virtual Queue**: Manage high-demand showtimes

### Support & Maintenance

For issues, questions, or contributions:
- **GitHub**: https://github.com/shankerpangeni/movie-booking-system
- **Email**: shankerpangeni114@gmail.com

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Author**: Shanker Pangeni
