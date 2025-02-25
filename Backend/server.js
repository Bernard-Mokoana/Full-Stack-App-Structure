import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

import router from "./src/routes/user.routers.js";

app.use("/api/users", router)

export default app;