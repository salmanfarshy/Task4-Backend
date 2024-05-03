import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const dateObject = new Date(Date.now());

    // Get month name
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[dateObject.getMonth()];

    // Get last two digits of the year
    const yearLastTwoDigits = dateObject.getFullYear().toString().slice(-2);

    // Get hours in 12-hour format
    let hours = dateObject.getHours();
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    // Formatted time string with 12-hour format
    const formattedTime = `${hours}:${("0" + dateObject.getMinutes()).slice(
      -2
    )} ${amPm}`;

    // Formatted date string
    const formattedDate = `${dateObject.getDate()}-${monthName}-${yearLastTwoDigits}, ${formattedTime}`;

    // CREATE A NEW USER AND SAVE TO DB
    const highestUserId = await User.findOne().sort("-userId").exec();

    const nextUserId = highestUserId ? highestUserId.userId + 1 : 1;

    const data = {
      userId: +nextUserId,
      registrationTime: formattedDate,
      ...req.body,
    };

    const newUser = await User.create(data);
    console.log(newUser);

    const token = jwt.sign(
      {
        userId: newUser.userId,
        name: newUser.name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7h" }
    );

    const { userId, name } = newUser;

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 25200000,
      })
      .json({
        message: "User created successfully.",
        userId,
        name,
      });
  } catch (err) {
    return res.json({
      message: "User may exist or check the credentials.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const dateObject = new Date(Date.now());

    // Get month name
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[dateObject.getMonth()];

    // Get last two digits of the year
    const yearLastTwoDigits = dateObject.getFullYear().toString().slice(-2);

    // Get hours in 12-hour format
    let hours = dateObject.getHours();
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    // Formatted time string with 12-hour format
    const formattedTime = `${hours}:${("0" + dateObject.getMinutes()).slice(
      -2
    )} ${amPm}`;

    // Formatted date string
    const formattedDate = `${dateObject.getDate()}-${monthName}-${yearLastTwoDigits}, ${formattedTime}`;

    // CHECK IF THE USER EXISTS
    const user = await User.findOne({ email });

    if (!user)
      return res.json({
        message: "User doesn't exist. Maybe deleted your acoount by someone.",
      });

    if (password !== user.password)
      return res.json({ message: "Wrong password." });

    const token = jwt.sign(
      {
        userId: user.userId,
        name: user.name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7h" }
    );

    const { userId, name } = user;
    if (!user.status) return res.json({ userId: false });
    else {
      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 25200000,
        })
        .json({ userId, name, lastLoginTime: formattedDate });
    }
  } catch (err) {
    return res.json({ message: "Failed to login!" });
  }
};

export const checkUser = (req, res) => {
  const { token } = req.cookies;
  console.log(req.cookies);

  if (!token) return res.json({ Id: false });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.json({ Id: false });
    return res.json({ Id: payload?.userId, name: payload?.name });
  });
};

export const logout = (req, res) => {
  const { token } = req.cookies;
  console.log(req.body.data);
  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    console.log(payload?.userId);
    await User.findOneAndUpdate(
      { userId: payload?.userId },
      { lastLoginTime: req.body.data }
    );
  });

  res.clearCookie("token").json({ message: "Logout Successful" });
};

export const users = async (req, res) => {
  const users = await User.find().select("-_id -__v -password");
  res.json(users);
};

export const deleteUsers = async (req, res) => {
  const { token } = req.cookies;
  const ids = req.body;
  const idsArray = ids.map((str) => +str);
  let id = 0;

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    console.log(ids);
    console.log(payload?.userId);
    id = payload?.userId;
  });

  const result = await User.deleteMany({ userId: { $in: ids } });

  if (result.acknowledged && idsArray.includes(id)) {
    return res.clearCookie("token").json("Deleted users and you successfully.");
  } else if (result.acknowledged) {
    return res.json("Deleted users successfully.");
  } else return res.status(501).json("Something wrong delete failed.");
};

export const blockOrUnblockUsers = async (req, res) => {
  const { token } = req.cookies;
  const { selectedItems: ids, status } = req.body;
  const idsArray = ids.map((str) => +str);
  let id = 0;
  console.log(status);

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    console.log(ids);
    console.log(payload?.userId);
    id = payload?.userId;
  });

  const result = await User.updateMany({ userId: { $in: ids } }, { status });

  if (result.nModified === 0 && !status) return json("users block failed.");
  else if (result.nModified === 0 && status)
    return json("users unblock failed.");
  else {
    if (idsArray.includes(id) && !status)
      return res.clearCookie("token").json("users and you are blocked.");
    else if (!status) return res.json("users are blocked.");
    else return res.json("users are unblocked.");
  }
};
