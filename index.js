const dotenv= require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
mongoose.connect(process.env.SECURE)
const express = require("express");
const app = express();
const session = require("express-session");
const nocache = require ("nocache")

const sessionSecret='mysession-secret'

app.use(
  session({
      secret:sessionSecret,
      saveUninitialized:true,
      resave:false,
      // cookie:{
      //     maxAge:500000,
      // },
  })
);



const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache())



// Routes
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");


app.use("/", userRoute);
app.use('/admin',adminRoute)



app.listen(process.env.PORT, function () {
  console.log("Server running");
});
