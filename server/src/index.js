const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());
// Enhanced logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const cors = require('cors');

// Replace existing CORS middleware with this
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Auth middleware
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error('Authentication required');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Explicitly exclude password from the query
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                // Add other fields you want to include
                // but explicitly exclude password
            }
        });

        if (!user) throw new Error('User not found');

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const userRouter = require('./routes/users')
app.use('/users', userRouter)

// Get Hotels
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany();
        res.json(hotels);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ message: 'Failed to fetch hotels' });
    }
});

// Get specific hotel
app.get('/api/hotels/:id', async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);

        if (isNaN(hotelId)) {
            return res.status(400).json({ message: 'Invalid hotel ID' });
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json(hotel);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ message: 'Failed to fetch hotel' });
    }
});



// Create Booking
app.post('/api/bookings', auth, async (req, res) => {
    try {
        const { hotelId, checkIn, checkOut, guestCount } = req.body;

        // Validate input
        if (!hotelId || !checkIn || !checkOut || !guestCount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId: req.user.id,
                hotelId,
                checkIn: checkInDate,
                checkOut: checkOutDate
            }
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Failed to create booking' });
    }
});

// Get user bookings
app.get('/api/bookings', auth, async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
                hotel: true,
                guests: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// Add Guests (Web Check-In)
app.post('/api/guests', auth, async (req, res) => {
    try {
        const { bookingId, guests } = req.body;

        // Validate input
        if (!bookingId || !guests || !Array.isArray(guests) || guests.length === 0) {
            return res.status(400).json({ message: 'Valid booking ID and guest information required' });
        }

        // Verify booking belongs to user
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId: req.user.id
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        // Validate guest data
        for (const guest of guests) {
            if (!guest.name || !guest.aadhaar || !/^\d{12}$/.test(guest.aadhaar)) {
                return res.status(400).json({ message: 'Invalid guest information' });
            }
        }

        // Create guests
        const createdGuests = await prisma.guest.createMany({
            data: guests.map(guest => ({
                name: guest.name,
                aadhaar: guest.aadhaar,
                bookingId
            }))
        });

        res.status(201).json({
            message: 'Guests added successfully',
            count: createdGuests.count
        });
    } catch (error) {
        console.error('Guest creation error:', error);

        // Handle duplicate Aadhaar error
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'A guest with this Aadhaar number already exists' });
        }

        res.status(500).json({ message: 'Failed to add guests' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));