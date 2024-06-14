import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import Listing from "../models/listing.model.js";
import errorHandler from '../utils/ErrorHandler.js';
// Make sure this path is correct
// Adjust the path accordingly
 // Adjust the path accordingly


export const test = (req, res) => {
    res.json({
        message: 'API route is working',
    });
};
export const updateUser = async (req, res, next) => {
    try {
        // Authorization Check
        if (req.user.id !== req.params.id) {
            const error = new Error("You can only update your own account");
            error.statusCode = 403;
            throw error;
        }

        // Hash the password if provided
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        // Update user data
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar,
            }
        }, 
        { new: true });
    
        // Response
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        // Pass the error to the error handling middleware
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const result = await User.findByIdAndDelete(userId, { timeout: true });

        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.clearCookie('access_token');
        res.status(200).json({ success: true, message: 'User has been deleted...' });
    } 
    catch (err) {
        if (err.name === 'MongoServerSelectionError') {
            res.status(503).json({ success: false, message: 'Service unavailable. Please try again later.' });
        } else if (err.message.includes('buffering timed out')) {
            res.status(500).json({ success: false, message: 'Request timed out. Please try again later.' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
        next(err);
    }
};

export const getUserListings = async (req, res, next) => {
    // Check if the user is trying to view their own listings
    if (req.user.id === req.params.id) {
        try {
            // Fetch listings for the user
            const listings = await Listing.find({ userRef: req.params.id });
            res.status(200).json(listings);
        } catch (error) {
            next(error); // Pass the error to the error handling middleware
        }
    } else {
        // Return a 403 Forbidden error if the user tries to access listings of another user
        return next(errorHandler(403, 'You can only view your own listings'));
    }
};

export const getUser = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.params.id);
    
        if (!user) return next(errorHandler(404, 'User not found!'));
    
        const { password: pass, ...rest } = user._doc;
    
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};