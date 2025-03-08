import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

export const verifyJWT = async (req, _, next) => {
    const token = req.cookies.accessToken || req.header;
    ("Authorization")?.replace("Bearer ","")

    if(!token) {
        return res.status(401).json({message: "Unauthorized"})
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user) {
            console.log("Unauthorized");
            throw new Error("Unauthorized");
            // return res.status(401).json({message: "Unauthorized"})
        }

        req.user = user;

        next();
    } 
    catch(error) {
        console.log("Invalid access token");
        throw new Error("Invalid access token")
        // return res.status(401).json({message: "Invalid access token"});
    }
}
