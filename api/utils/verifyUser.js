import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies ? req.cookies.access_token : null;

    if (!token) {
        console.log('No token provided');
        return next(errorHandler(401, 'Unauthorized'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err);
            return next(errorHandler(403, 'Forbidden'));
        }
        req.user = user;
        next();
    });
};
