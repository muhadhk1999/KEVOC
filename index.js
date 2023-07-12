const dotenv= require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
mongoose.connect(process.env.secure)


const express = require("express");
const app = express();
//require('./config/config')
const path = require("path");
app.set("view engine", "ejs");
app.set("views", "./view/user");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

app.use("/", userRoute);
//app.use("/admin", adminRoute);
app.use('/admin',adminRoute)

//Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.render('404')
});
const morgan = require('morgan');
app.use(morgan('tiny'));

app.listen(process.env.port, function () {
  console.log("Server running");
});
