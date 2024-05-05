import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import {
  login,
  register,
  logout,
  checkUser,
  users,
  deleteUsers,
  blockOrUnblockUsers,
} from "./controllers/auth.controller.js";

const app = express();

app.use(
  cors({
    origin: "https://task4-client-app.onrender.com",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// db.js
mongoose
  .connect(process.env.Mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

app.post("/register", register);
app.post("/login", login);
app.post("/checkUser", checkUser);
app.post("/logout", logout);
app.get("/users", users);
app.delete("/deleteUsers", deleteUsers);
app.patch("/blockOrUnblockUsers", blockOrUnblockUsers);

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is running!");
});
