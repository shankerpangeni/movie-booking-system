// Quick script to create an admin user
// Run this with: node createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profileImage: { type: String },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@cinebook.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email: admin@cinebook.com');
            console.log('Password: admin123');

            // Update role to admin if it's not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated user role to admin');
            }

            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@cinebook.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('=================================');
        console.log('  Admin Login Credentials');
        console.log('=================================');
        console.log('Email:    admin@cinebook.com');
        console.log('Password: admin123');
        console.log('=================================');
        console.log('');
        console.log('You can now login at: http://localhost:3000/login');
        console.log('Then access admin dashboard at: http://localhost:3000/admin/dashboard');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminUser();
