import { User } from "../models/user.models.js";

const registerUser = async (req, res) => {
    const {username, email, password} = req.body;

    if([username, email, password].some((field) => field?.trim() ===  " "))
    {
        throw new Error("All fields required");
    }

    const existedUser = await username.findOne({
        $for: [{username}, {email}]
    });

    if(existedUser) {
        throw new Error("User with email and username already exists");
    }

    let user;
    try{
        user = await User.create({
            email,
            username: username.toLowerCase(),
        });

        const createdUser = await User.findById(user._id).select("-password");

        if(!createdUser) {
            throw new Error("Something went wrong while registering a user")
        }

        return res.status(201).json("User registered successfully")
    } catch(error) {
        console.error("User craetion failed: ", error);

        throw new Error("Something went wrong while registering a user")
    }
}

const loginInUser = async (req, res) => {
    const {username, password, email} = req.body;

    if(!email) {
        throw new Error("Email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user) {
        throw new Error("User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new Error("User not logged in")
    }

    return res.status(200).json("User logged in successfully")
}

export {
    registerUser,
    loginInUser,
}