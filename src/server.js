import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import couponRoutes from "./routes/coupon.route.js";

dotenv.config();
const app = express();

app.use(express.json());

// routes
app.use("/api/coupons", couponRoutes);

// connect to db and start server

// only run server if not in test environment

if(process.env.NODE_ENV !== "test"){
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;

