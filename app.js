import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/auth.js";

const app = express();

config();
dbConnect();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});
app.use("/api", authRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Listening on port ${port}...`));
