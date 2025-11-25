// Update user role to admin
// Run with: node updateUserRole.js

const mongoose = require('mongoose');
require('dotenv').config();

async function updateUserRole() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String,
            profileImage: String
        }));

        const user = await User.findOneAndUpdate(
            { email: 'admin@cinebook.com' },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log('✅ User role updated to admin!');
            console.log('User:', user.name, '-', user.email);
            console.log('Role:', user.role);
        } else {
            console.log('❌ User not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateUserRole();
