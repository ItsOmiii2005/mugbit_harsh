
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

// Connecting to the database
// Connected to mongodb
mongoose.connect("mongodb+srv://harsh:h1h2h3h4h5h6h7@cluster0.0jmtyiz.mongodb.net/pymongo?retryWrites=true&w=majority");

// Signup controller goes here..
const signup = async (req, res) => {
    try {
        const { username, useremail, password } = req.body;
        const image = req.file.filename;

        console.log(req.body);

        // check if the user already exists
        const existingUser = await User.findOne({ useremail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // hashing the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        // Now, create a new user
        const newUser = new User({
            username,
            email: useremail,
            password: hashedPassword,
            image
        });

        // Saving the new user..
        await newUser.save();

        // Create a JWT Token.
        const secretKey = process.env.JWT_SECRET || "defaultSecretKey";
        const token = jwt.sign({
            email: newUser.email
        }, secretKey);

        // Respond with the token and user information
        res.status(201).json({ token, user: { userId: newUser._id, username: newUser.username, email: newUser.email, img: newUser.image } });
    } catch (error) {
        console.log("Error during Signup: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(req.body);
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const imageUrl = user.image ? `http://localhost:7000/uploads/images/${user.image}` : null;

        // Create a JWT Token
        const secretKey = process.env.JWT_SECRET || "defaultSecretKey";
        const token = jwt.sign({ userId: user._id, username: user.username, email: user.email, userimg: imageUrl }, secretKey);



        console.log(imageUrl);

        // Respond with the token and user information
        res.status(200).json({ token, user: { userId: user._id, username: user.username, email: user.email, userimg: imageUrl } });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// const updateProfilePicture = async (req, res) => {
//     try {
//         const { email } = req.body;
//         const image = req.file.filename;

//         // Update the user's profile image
//         const updatedUser = await User.findOneAndUpdate(
//             { email },
//             { $set: { image } },
//             { new: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Respond with the updated user information
//         const imageUrl = updatedUser.image ? `http://localhost:7000/uploads/images/${updatedUser.image}` : null;
//         res.status(200).json({ user: { username: updatedUser.username, email: updatedUser.email, userimg: imageUrl } });
//     } catch (error) {
//         console.error('Error during profile picture update:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }

const updateProfilePicture = async (req, res) => {
    try {
        const { email } = req.body;
        const image = req.file.filename;

        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's profile image
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { image } },
            { new: true }
        );

        // Respond with the updated user information
        const imageUrl = updatedUser.image ? `http://localhost:7000/uploads/images/${updatedUser.image}` : null;
        res.status(200).json({ user: { userId: user._id, username: updatedUser.username, email: updatedUser.email, userimg: imageUrl } });
    } catch (error) {
        console.error('Error during profile picture update:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getProfileByUsername = async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        username: user.username,
        email: user.email,
        userimg: user.image, // Add other user fields as needed
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

module.exports = {
    signup,
    login,
    updateProfilePicture,
    getProfileByUsername
}
