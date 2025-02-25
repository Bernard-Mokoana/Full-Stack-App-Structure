import mongoose from "mongoose";
import { DB_NAME } from "../../contants.js";

const connectDB = async () => {
    try {
        const connectionDB = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`\n MongoDB connected ! DB host:${connectionDB.connection.host}`);
    } catch (error) {
        console.log("MongoDB connecttion error", error);
    }
}

export default connectDB;