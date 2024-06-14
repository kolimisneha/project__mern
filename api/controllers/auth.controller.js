import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define a custom error handler function
const errorHandler = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }
  
    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);
  
    // Create a new user instance
    const newUser = new User({ username, email, password: hashedPassword });
  
    // Save the new user to the database
    await newUser.save();
    
    // Send success response
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const validUser = await User.findOne({ email });
    if (!validUser) {
      // If user not found, return error
      throw errorHandler(404, 'User not found');
    }

    // Compare password
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      // If password is invalid, return error
      throw errorHandler(401, 'Wrong credentials');
    }

    // If user is found and password is correct, create JWT token
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
const { password:pass, ...rest}=validUser._doc;
    // Set JWT token in cookie and send user details in response
    res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};





export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password, ...rest } = user._doc;
      res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      // Generate a username (example: first part of email)
      const username = req.body.email.split('@')[0];
      
      const newUser = new User({
        username: username,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo // Check if 'photo' is received correctly
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password, ...rest } = newUser._doc;
      res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut=async(req,res,next)=>{
  try{
res.clearCookie('access_token');
res.status(200).json('User has been logged out!');
  }
  catch(error){
    next(error);
  }
}