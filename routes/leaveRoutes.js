
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
    const {
        username,
        email,
        rollNumber,
        casualLeave = 0,
        medicalLeave = 0
    } = req.body;

    try {
        if (!username || !email || !rollNumber) {
            return res.status(400).json({
                message: 'Username, email and roll number are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Invalid email format'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        const newUser = new User({
            username,
            email,
            rollNumber,
            casualLeave: Number(casualLeave),
            medicalLeave: Number(medicalLeave)
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser._id,
            username: newUser.username,
            rollNumber: newUser.rollNumber,
            casualLeave: newUser.casualLeave,
            medicalLeave: newUser.medicalLeave
        });
    } catch (error) {
        console.error('Error creating user:', error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'Login successful',
            userId: user._id,
            username: user.username,
            rollNumber: user.rollNumber,
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        console.error('Error during login:', error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// Get Leave Balance
router.get('/leave-balance/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        console.error('Error fetching leave balance:', error);

        res.status(400).json({
            message: 'Invalid user ID or request'
        });
    }
});

// Apply for Leave (Deduct Available Leave)
router.post('/apply-leave/:id', async (req, res) => {
    const { type, days } = req.body;

    try {
        const leaveDays = Number(days);

        if (!Number.isInteger(leaveDays) || leaveDays <= 0) {
            return res.status(400).json({
                message: 'Enter a valid number of leave days'
            });
        }

        if (!['casual', 'medical'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid leave type'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (type === 'casual') {
            if (leaveDays > user.casualLeave) {
                return res.status(400).json({
                    message: 'Insufficient casual leave balance'
                });
            }

            user.casualLeave -= leaveDays;
        } else {
            if (leaveDays > user.medicalLeave) {
                return res.status(400).json({
                    message: 'Insufficient medical leave balance'
                });
            }

            user.medicalLeave -= leaveDays;
        }

        await user.save();

        res.json({
            message: 'Leave applied successfully',
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        console.error('Error applying for leave:', error);

        res.status(400).json({
            message: 'Unable to process leave application'
        });
    }
});

module.exports = router;
