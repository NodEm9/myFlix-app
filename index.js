/* eslint-disable no-undef */
const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  compression = require("compression"),
  cors = require("cors");

const port = process.env.PORT; 

var app = express();
app.use(compression());

require("dotenv").config();
const db = require("./config/db.js");
db();

const corsOptions = require("./config/corOptions.js");
const credentials = require("./middleware/credentials.js");
const errorHandler = require("./middleware/error.handler.js")

app.use(credentials);
app.use(cors(corsOptions));

const { check } = require("express-validator");

let movies = require("./controllers/movies.js");
let users = require("./controllers/users.js");


const accesLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" });

app.use(morgan("combined", { stream: accesLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

require("./controllers/auth/auth")(app); 
let passport = require("passport");
require("./controllers/auth/passport");

app.use(express.static('public')); 

app.get("/movies", passport.authenticate("jwt", { session: false }), movies.getMovies);
app.get("/movies/:title", passport.authenticate("jwt", { session: false }), movies.getMovieByTitle);
app.get("/movies/genre/:genreName", passport.authenticate("jwt", { session: false }), movies.getGenreByName);
app.get("/movies/director/:directorName", passport.authenticate("jwt", { session: false }), movies.getDirectorByName);

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


app.get("/documentation", (req, res) => {
  res.sendFile("public")
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on http://localhost:${port}`)); 


module.exports = app;