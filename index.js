/**
 * @name index.js
 * @description This file is the entry point for the application. It sets up the server and connects to the database.
 * It also sets up the routes for the application and validates users inputs.
 * @see {@link module:controllers/auth/auth} for the auth controller
 * @constant {function} errorHandler - The errorHandler function
 * @constant {object} app - The express application
 */
const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  compression = require("compression"),
  cors = require("cors");

  
// Create an instance of express
var app = express();
app.use(compression());

require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB"});

const corsOptions = require("./config/corOptions.js");
const credentials = require("./middleware/credentials.js");


app.use(credentials);
app.use(cors(corsOptions));

const { check } = require("express-validator");

let movies = require("./controllers/movies.js");
let users = require("./controllers/users.js");

const PORT = process.env.PORT || 8080; /* eslint no-undef: off */

// Create a write stream (in append mode)
const accesLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" });

// Setup the logger
app.use(morgan("combined", { stream: accesLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


require("./controllers/auth/auth")(app); /* eslint no-unused-vars: off */
let passport = require("passport");
require("./controllers/auth/passport");

app.use(express.static('public')); // Serve documentation

/**
 * @name GET /movies - Get the list of all movies
 * @function getMovies - Get the list of all movies
 *  The movies routes are protected by JWT authentication and authorization.
 * user must be logged in to access the movies routes.
 */
app.get("/movies", passport.authenticate("jwt", { session: false }), movies.getMovies);
app.get("/movies/:title", passport.authenticate("jwt", { session: false }), movies.getMovieByTitle);
app.get("/movies/genre/:genreName", passport.authenticate("jwt", { session: false }), movies.getGenreByName);
app.get("/movies/director/:directorName", passport.authenticate("jwt", { session: false }), movies.getDirectorByName);

// Users routes
app.get("/users", passport.authenticate("jwt", { session: false }), users.getUsers);

/**
 * @name POST /users - Add a new user
 * @function addUser - Adds data for a new user to our list of users.
 *  This part of the code validates the user input before adding the user to the database.
 */
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

/**
 * @name POST /users/:Username/movies/:MovieID - Add a favorite movie
 * @function addFavoriteMovie - Add favorite movies to user favorite movies array list
 * @name GET /users/:Username/movies/favorites - Get favorite movies
 *  The users routes are protected by JWT authentication and authorization. 
 * The user must be logged in to access the users routes.
 */
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
}

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on ${PORT}`)); 
// Listen for requests
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = app;