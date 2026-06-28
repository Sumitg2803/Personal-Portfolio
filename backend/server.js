const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Specific origin CORS — fixes 'credentials + wildcard' conflict from vercel.json headers
app.use(cors({
    origin: [
        'https://sg-personal-portfolio.vercel.app',  // Actual frontend deployment
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-key']
}));
app.options('*', cors()); // Handle preflight
app.use(express.json());

// MongoDB Connection
// Note: useNewUrlParser & useUnifiedTopology are deprecated and removed in Mongoose 8+
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas (portfolioDB)'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Mongoose Schema and Model
const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', ContactSchema);

// ===============================
// DEBUG ROUTE
// ===============================
app.get('/test-db', async (req, res) => {
    try {
        console.log("🟢 TEST-DB ROUTE HIT");

        const count = await Contact.countDocuments();

        res.status(200).json({
            success: true,
            mongoConnected: mongoose.connection.readyState,
            totalMessages: count
        });

    } catch (err) {
        console.error("❌ TEST-DB ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ===============================
// CONTACT ROUTE WITH DEBUG LOGS
// ===============================
app.post('/contact', async (req, res) => {

    console.log("====================================");
    console.log("🚀 CONTACT ROUTE HIT");
    console.log("====================================");

    console.log("Mongo URI Exists:", !!process.env.MONGO_URI);

    try {

        console.log("📦 Raw Request Body:", req.body);

        const { name, email, phone, message } = req.body;

        console.log("📋 Extracted Data:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Phone:", phone);
        console.log("Message:", message);

        if (!name || !email || !phone || !message) {

            console.log("❌ VALIDATION FAILED");

            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        console.log("📝 Creating MongoDB Document...");

        const newContact = new Contact({
            name,
            email,
            phone,
            message
        });

        console.log("💾 Saving to MongoDB...");

        await newContact.save();

        console.log("✅ MESSAGE SAVED SUCCESSFULLY");

        res.status(201).json({
            success: true,
            message: 'Message saved successfully!'
        });

    } catch (error) {

        console.error("❌ SAVE ERROR:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===============================
// ADMIN ROUTE
// ===============================
app.get('/messages', async (req, res) => {
    try {

        const adminKey = req.headers['x-admin-key'];

        if (!process.env.ADMIN_PASSWORD) {
            return res.status(500).json({
                error: 'Server configuration error: Admin password not set.'
            });
        }

        if (adminKey !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                error: 'Unauthorized: Invalid Admin Password'
            });
        }

        const messages = await Contact.find().sort({ time: -1 });

        res.status(200).json(messages);

    } catch (error) {

        console.error('❌ Error fetching messages:', error);

        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// Localhost only
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

app.get('/env-check', (req, res) => {
    res.json({
        mongoExists: !!process.env.MONGO_URI,
        mongoLength: process.env.MONGO_URI
            ? process.env.MONGO_URI.length
            : 0
    });
});

// Export for Vercel
module.exports = app;