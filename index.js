import express from "express";
const app = express();
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/user.js";
import cookieParser from "cookie-parser";

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// setting up view Engine
app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//   res.render("index", {
//     name: "Varma",
//   });
// });

// app.post("/adddata", (req, res) => {
//   const { name, email } = req.body;
//   console.log(name, email);

//   User.create({
//     name: name,
//     email: email,
//   }).then(() => {
//     res.redirect("/data");
//   });
// });

// app.get("/data", async (req, res) => {
//   const users = await User.find();
//   res.render("data", {
//     users,
//   });
// });

// Authentication:
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

app.use(cookieParser());

const isAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } else {
    res.render("login");
  }
};

app.get("/", isAuth, (req, res) => {
  res.render("logout", {
    user: req.user,
  });
});

app.post("/login", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({
    email: email,
  });

  if (user) {
    res.render("login", {
      message: "User already exists",
    });
  } else {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashed,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60),
    });
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("server started");
});
