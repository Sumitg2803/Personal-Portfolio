const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
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

// API Routes

// 1. Receive Contact Form Data
app.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();

        res.status(201).json({ success: true, message: 'Message saved successfully!' });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Fetch All Messages for Admin Panel
app.get('/messages', async (req, res) => {
    try {
        const adminKey = req.headers['x-admin-key'];
        
        if (!process.env.ADMIN_PASSWORD) {
            return res.status(500).json({ error: 'Server configuration error: Admin password not set.' });
        }

        if (adminKey !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        // Fetch and sort by newest first
        const messages = await Contact.find().sort({ time: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server locally if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Export the Express API for Vercel
module.exports = app;
