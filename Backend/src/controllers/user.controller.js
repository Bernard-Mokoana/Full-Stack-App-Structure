import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(
    {
        path: "./.env"
    }
)

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if(!user) {
            console.log("User not found");
            throw new Error("User not found");
            // return res.status(404).json({message: "User not found!"})
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
       

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

       
        return {accessToken, refreshToken};
    } catch (error) {
        console.log("Something went wrong while generating access and refresh token", error.message);
        throw error;
        // return res.status(500).json({message: "Something went wrong while generating access and refresh token"});
    }
}
const registerUser = async (req, res) => {
  
    const {fullname, lastname,username, email, password} = req.body;

    if(!fullname || !lastname || !username || !email || !password) {
        return res.status(400).json({message: "All fields are required."})
    }

    try
    {
    const existedUser = await User.findOne({ 
        $or: [{username}, {email}]
    });

    if(existedUser) {
       return res.status(400).json({message: "User with email and password already exists"})
    }

     const user = await User.create({
            fullname,
            lastname,
            email,
            username: username.toLowerCase(),
            password
        });

        const createdUser = await User.findById(user._id).select("-password");

        if(!createdUser) {
           return res.status(500).json({message: "Something went wrong while registering user, User not created"})
        }

        return res.status(201).json({message: "User registered successfully", user: createdUser});

    } catch(error) {
        console.error("User craetion failed: ", error);

        return res.status(500).json({message: "Something went wrong while registering the user"})
    }
}

const loginInUser = async (req, res) => {
    
    const {password, email} = req.body;

    if(!email) {
       return res.status(400).json({message: "Email is required"})
    }

    if(!password) {
        return res.status(401).json({message: "Password is required"})
    }

    try {
        const user = await User.findOne({
            $or: [{email}]
        }).select("+password");
    
        if(!user) {
            return res.status(404).json({message: "User not found"})
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password);
    
        if(!isPasswordValid) {
            return res.status(404).json({message: "Invalid credentials"})
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        if(!loggedInUser) {
            return res.status(400, "User not logged in");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({message: "User logged in successfully", user: loggedInUser})
    } 
    catch (error) {
        console.error("Login failed; ", error);
        return res.status(500).json({message: "Something went wrong while logging in"})
    }
}

const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
            refreshToken: undefined,
        },
    },
        { new: true }
    )


const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json({message: "User logged out successfully"});

}

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        return res.status(401).json("No refresh token provided");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

      
        const user = await User.findById(decodedToken?._id);

        if(!user) {
            return res.status(401).json({message: "Invalid refresh token"});
        }

         const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

       const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

       return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({ 
                message: "Access token refreshed successfully", 
                accessToken, 
                refreshToken: newRefreshToken 
            });
    }
    catch (error) {
        return res
        .status(500)
        .json({message: "Something went wrong refreshing access token"}, error)
    }
}

export {
    registerUser,
    loginInUser,
    logoutUser,
    refreshAccessToken,
}   