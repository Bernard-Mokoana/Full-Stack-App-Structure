import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

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
            return res.status(401).json({message: "Unauthorized"})
        }

        req.user = user;

        next();
    } 
    catch(error) {
        return res.status(401).json({message: "Invalid access token"});
    }
}

