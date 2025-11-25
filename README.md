# 🎬 Movie Booking System

A full-stack movie ticket booking application built with **Next.js 16**, **MongoDB**, **Stripe**, and **Cloudinary**. This system allows users to browse movies, select seats in real-time, and complete bookings with secure payment processing.

## 🌐 Live Demo

**[View Live Demo →](https://movie-booking-system-snowy.vercel.app/)**

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Payment-blue?logo=stripe)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-blue?logo=cloudinary)

## 🌟 Features

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Browse Movies**: View now-showing and upcoming movies with detailed information
- **Real-time Seat Selection**: Interactive seat map with live availability updates
- **Seat Reservation System**: Temporary seat holds (5 minutes) during booking process
- **Secure Payments**: Stripe integration for safe payment processing
- **Booking Management**: View booking history with QR codes
- **Profile Management**: Update profile information and upload profile pictures

### Admin Features
- **Admin Dashboard**: Comprehensive overview of bookings and revenue
- **Movie Management**: Add, edit, and delete movies with cast information
- **Hall Management**: Create and manage cinema halls
- **Screen Management**: Configure screens with custom seat layouts (Regular, Premium, VIP)
- **Showtime Scheduling**: Create and manage movie showtimes
- **Cloudinary Integration**: Upload and manage movie posters, covers, and cast images

### Technical Features
- **Real-time Updates**: Seat availability updates every 5 seconds
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **State Management**: Redux Toolkit for global state
- **Image Optimization**: Next.js Image component with Cloudinary
- **Server-side Rendering**: Fast page loads with Next.js SSR
- **API Routes**: RESTful API built with Next.js API routes
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Payment UI**: Stripe React Components

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8.19.3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer with Cloudinary storage
- **Payment Processing**: Stripe

### Cloud Services
- **Hosting**: Vercel
- **Database**: MongoDB Atlas
- **Media Storage**: Cloudinary
- **Payment Gateway**: Stripe

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas Account** (free tier available)
- **Cloudinary Account** (free tier available)
- **Stripe Account** (test mode available)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shankerpangeni/movie-booking-system.git
cd movie-booking-system/fullstacknextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the `fullstacknextjs` directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/movie-booking-system?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Application URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Go to **Database Access** → **Add New Database User**
   - Set username and password
   - Grant "Read and write to any database" privileges
4. Go to **Network Access** → **Add IP Address**
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
5. Get your connection string from **Database** → **Connect** → **Drivers**
6. Replace `<password>` with your database user password
7. Add `/movie-booking-system` after the cluster URL

### 5. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to **Dashboard**
3. Copy your **Cloud Name**, **API Key**, and **API Secret**
4. Add these to your `.env.local` file

### 6. Stripe Setup

1. Create an account at [Stripe](https://stripe.com/)
2. Go to **Developers** → **API Keys**
3. Copy your **Publishable Key** and **Secret Key** (use test mode keys)
4. Add these to your `.env.local` file

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Create Admin User

To access the admin panel, you need to create an admin user. You can use the provided script:

1. Open `fullstacknextjs/createAdmin.js`
2. Update the admin credentials if needed
3. Run:
```bash
node createAdmin.js
```

Or manually update a user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📁 Project Structure

```
fullstacknextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   ├── movies/
│   │   │   ├── halls/
│   │   │   ├── screens/
│   │   │   └── showtimes/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── movies/
│   │   │   ├── bookings/
│   │   │   ├── halls/
│   │   │   ├── screens/
│   │   │   ├── shows/
│   │   │   ├── seats/
│   │   │   └── payment/
│   │   ├── book/              # Booking pages
│   │   ├── movie/             # Movie details
│   │   ├── movies/            # Movies listing
│   │   ├── profile/           # User profile
│   │   └── page.jsx           # Homepage
│   ├── components/            # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Loading.jsx
│   │   ├── CountdownTimer.jsx
│   │   └── PaymentForm.jsx
│   ├── controllers/           # Business logic
│   │   ├── user.controller.js
│   │   ├── movie.controller.js
│   │   ├── booking.controller.js
│   │   ├── hall.controller.js
│   │   ├── screen.controller.js
│   │   └── showTime.controller.js
│   ├── models/                # MongoDB schemas
│   │   ├── user.models.js
│   │   ├── movie.models.js
│   │   ├── booking.models.js
│   │   ├── hall.models.js
│   │   ├── screen.models.js
│   │   ├── showTime.models.js
│   │   └── seatReservation.models.js
│   ├── middleware/            # Authentication middleware
│   │   └── auth.middleware.js
│   ├── lib/                   # Utilities
│   │   ├── connectDb.js
│   │   └── cloudinary.js
│   ├── redux/                 # State management
│   │   ├── store.js
│   │   └── slices/
│   └── config/                # Configuration
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.mjs           # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - User logout

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies?id={id}` - Get single movie
- `POST /api/movies` - Create movie (Admin)
- `PUT /api/movies?id={id}` - Update movie (Admin)
- `DELETE /api/movies?id={id}` - Delete movie (Admin)

### Halls
- `GET /api/halls` - Get all halls
- `POST /api/halls` - Create hall (Admin)
- `PUT /api/halls?id={id}` - Update hall (Admin)
- `DELETE /api/halls?id={id}` - Delete hall (Admin)

### Screens
- `GET /api/screens` - Get all screens
- `GET /api/screens?hallId={id}` - Get screens by hall
- `POST /api/screens` - Create screen (Admin)
- `PUT /api/screens?id={id}` - Update screen (Admin)
- `DELETE /api/screens?id={id}` - Delete screen (Admin)

### Showtimes
- `GET /api/shows` - Get all showtimes
- `GET /api/shows?id={id}` - Get single showtime
- `POST /api/shows` - Create showtime (Admin)
- `DELETE /api/shows?id={id}` - Delete showtime (Admin)

### Seats
- `POST /api/seats/reserve` - Reserve seats temporarily
- `POST /api/seats/release` - Release reserved seats

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings?id={id}` - Get single booking

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/webhook` - Stripe webhook handler

## 💳 Payment Flow

1. User selects seats and proceeds to payment
2. Frontend creates a Stripe payment intent via `/api/payment/create-intent`
3. User enters card details in Stripe Elements form
4. Payment is processed securely by Stripe
5. On success, booking is confirmed and seats are permanently reserved
6. User receives booking confirmation with QR code

**Test Card Numbers (Stripe Test Mode):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date, any 3-digit CVC, and any ZIP code

## 🎫 Seat Reservation System

The application implements a sophisticated seat reservation system:

1. **Temporary Reservation**: When a user selects seats, they are reserved for 5 minutes
2. **Real-time Updates**: Other users see these seats as unavailable
3. **Auto-release**: Unreserved seats are automatically released after 5 minutes
4. **Polling**: Seat availability is checked every 5 seconds
5. **Permanent Booking**: Seats become permanently booked after successful payment

## 🎨 Database Schema

### User
- name, email, password (hashed)
- role (user/admin)
- profileImage (Cloudinary URL)

### Movie
- title, description, duration, releaseDate
- genre (array), rating
- coverImage, poster (Cloudinary URLs)
- cast (array with name, role, image)
- status (now-showing/upcoming)

### Hall
- name, address, description

### Screen
- name, hall (reference)
- layout (array of seats with type and price)

### ShowTime
- hall, screen, movie (references)
- startTime, endTime

### Booking
- bookingReference (auto-generated)
- showtime, user (references)
- seats (array with seatName and price)
- paymentStatus (paid/pending/failed)
- paymentIntentId (Stripe)

### SeatReservation
- showtime, seatName
- user (reference)
- expiresAt (TTL index - auto-delete after 5 minutes)

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`
   - **Important**: Set `NEXT_PUBLIC_API_URL` to your Vercel deployment URL
5. Deploy!

### MongoDB Atlas for Production

1. In MongoDB Atlas, go to **Network Access**
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
   - This is required because Vercel uses dynamic IPs
3. Ensure your connection string is correct in Vercel environment variables

### Stripe Webhook Setup (Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.vercel.app/api/payment/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret
5. Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas Network Access allows your IP (0.0.0.0/0 for Vercel)
- Ensure database user has correct permissions
- Verify password doesn't contain special characters (or URL encode them)

### Cloudinary Upload Fails
- Verify API credentials are correct
- Check upload preset settings
- Ensure file size is within limits

### Stripe Payment Fails
- Use test card numbers in test mode
- Verify API keys are correct (test keys start with `pk_test_` and `sk_test_`)
- Check browser console for errors

### Seats Not Updating
- Check if polling is working (Network tab in DevTools)
- Verify MongoDB TTL index on `seatReservation.expiresAt`
- Clear browser cache and cookies

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Shanker Pangeni**
- GitHub: [@shankerpangeni](https://github.com/shankerpangeni)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Stripe for secure payment processing
- Cloudinary for media management
- MongoDB for the database solution
- Vercel for hosting platform

---

**Built with ❤️ using Next.js**
