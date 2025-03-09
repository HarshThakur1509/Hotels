const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

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
// Routes
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // if (!validator.isEmail(email)) throw new Error('Invalid email');
        // if (!validator.isStrongPassword(password)) throw new Error('Password not strong enough');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',  // Add this
            maxAge: 3600000
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',  // Add this
            maxAge: 3600000
        });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

router.get('/me', auth, (req, res) => {
    res.json(req.user);
});




module.exports = router