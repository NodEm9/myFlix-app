/**
 * @file index.js
 * @description This file is the entry point for the application. It sets up the server and connects to the database.
 * It also sets up the routes for the application.
 * @requires express
 * @requires morgan
 * @requires fs
 * @requires path
 * @requires cors
 * @requires mongoose
 * 
 */
const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB" });

const corsOptions = require("./config/corOptions.js");
const credentials = require("./middleware/credentials.js");

const { check } = require("express-validator");

let movies = require("./controllers/movies.js");
let users = require("./controllers/users.js");

const PORT = process.env.PORT || 8080; /* eslint no-undef: off */

// Create an instance of express
var app = express();

app.use(credentials);

// Create a write stream (in append mode)
const accesLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" });

// Setup the logger
app.use(morgan("combined", { stream: accesLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors(corsOptions));

require("./controllers/auth/auth")(app); /* eslint no-unused-vars: off */
let passport = require("passport");
require("./controllers/auth/passport");

app.use('/', express.static(path.join(__dirname, '/public')));

// Movies routes
app.get("/movies", passport.authenticate("jwt", { session: false }), movies.getMovies);
app.get("/movies/:title", passport.authenticate("jwt", { session: false }), movies.getMovieByTitle);
app.get("/movies/genre/:genreName", passport.authenticate("jwt", { session: false }), movies.getGenreByName);
app.get("/movies/director/:directorName", passport.authenticate("jwt", { session: false }), movies.getDirectorByName);

// Users routes
app.get("/users", passport.authenticate("jwt", { session: false }), users.getUsers);

app.post("/users", [
  check("Username", "Username is required").isLength({ min: 5 }),
  check("Username", "Username contains non alphanumeric characters - not allowed").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail()
], users.addUser);

app.get("/users/:Username", passport.authenticate("jwt", { session: false }), users.getUserByUsername);

app.put("/users/:Username", [
  check("Username", "Username is required").isLength({ min: 5 }),
  check("Username", "Username contains non alphanumeric characters - not allowed").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail()
], passport.authenticate("jwt", { session: false }),
  users.updateUser);

app.post("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }), users.addFavoriteMovie);
app.get("/users/:Username/movies/favorites", passport.authenticate("jwt", { session: false }), users.getFavoriteMovies);
app.delete("/users/:Username", passport.authenticate("jwt", { session: false }), users.deleteUser);
app.delete("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }), users.removeFavoriteMovie);


// Get the documentation
app.get("/documentation", (req, res) => {
  res.sendFile("public")
});

// Error handling
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).send("Something is broken!")
  res.render('error', { error: err })
}

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on ${PORT}`)); 
// Listen for requests
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = app;