const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const passport = require("passport");
// var bodyParser = require("body-parser");

const app = express();
/* Passport Setup */
// app.use(
//   require("express-session")({
//     secret: "randomized string",
//     resave: true,
//     saveUninitialized: true,
//   })
// );
app.use(passport.initialize());
app.use(passport.session());

/* Misc */
// app.use(express.urlencoded()); //Allows us to take data from forms.
app.use(express.json()); //Allows us to take data from forms.

/* MONGODB SETUP */
const uri = process.env.MONGODB_URL;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Could not connect to MongoDB!", err.message);
  });

/* Routing */

const auth = require("./routes/auth");
app.use("/auth", auth);
const index = require("./routes/index");
app.use("/", index);
const tweets = require("./routes/tweets");
app.use("/tweets", passport.authenticate("jwt", { session: false }), tweets);
const users = require("./routes/users");
app.use("/users",passport.authenticate("jwt", { session: false }), users);

app.listen(3001);
