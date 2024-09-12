/**
 * @name User Module - Express controller for user endpoints.
 * @module controllers/users 
 * @requires express
 * @requires mongoose
 * @requires dotenv
 * @requires models/models
 * @requires express-validator
 * @exports getUsers
 * @see {@link module:controllers/users.getUsers} for the getUsers function
 * @exports addUser
 * @see {@link module:controllers/users.addUser} for the addUser function
 * @exports getUserByUsername
 * @see {@link module:controllers/users.getUserByUsername} for the getUserByUsername function
 * @exports addFavoriteMovie
 * @see {@link module:controllers/users.addFavoriteMovie} for the addFavoriteMovie function
 * @exports getFavoriteMovies
 * @see {@link module:controllers/users.getFavoriteMovies} for the getFavoriteMovies function
 * @exports removeFavoriteMovie
 * @see {@link module:controllers/users.removeFavoriteMovie} for the removeFavoriteMovie function
 * @exports updateUser
 * @see {@link module:controllers/users.updateUser} for the updateUser function
 * @exports deleteUser
 * @see {@link module:controllers/users.deleteUser} for the deleteUser function
 * @exports resetPassword
 * @see {@link module:controllers/users.resetPassword} for the resetPassword function
 * @params {object} req - The request object
 * @params {object} res - The response object
 * @returns {object} res - The response object
 * @function getUsers - Get all users in the database 
 * @function addUser - Adds data for a new user to our list of users.
 * @function getUserByUsername - Get a user by username
 * @function addFavoriteMovie - Add favorite movies to user favorite movies array list
 * @function getFavoriteMovies - Get favorite movies from user favorite movies array list
 * @function removeFavoriteMovie - Remove favorite movies from user favorite movies array list
 * @function updateUser - Update user data
 * @function deleteUser - Delete user data by username
 * @function resetPassword - Reset user password
 * @constant {object} mongoose - The mongoose object
 * @constant {object} Models - The models object
 * @constant {function} validationResult - The validationResult function
 * @constant {object} Users - The Users model
 */

require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB" }); /* eslint no-undef: off */


let Models = require("../model/models.js");
let Users = Models.User;

const { validationResult } = require("express-validator");

// Adds data for a new user to our list of users.
async function addUser(req, res) {
  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // Hash the password
  let hashedPassword = Users.hashPassword(req.body.Password)
  // Check if the user already exists
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        res.status(400).send({ message: req.body.Username + " already exists"})
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          Role: req.body.Role
        })
          .then(user => res.status(201).json({message: "User created successfully", user: user, status: "success"}))
          .catch(err => {
            res.status(500).send("Error: " + err)
          })
      }
    }).catch((err) => {
      res.status(500).send("Error: " + err)
    });
};

// Get all users in the database
async function getUsers(req, res) {
  await Users.find()
    .then(users => {
      res.status(200).json(users)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};



// Get a user by username
async function getUserByUsername(req, res) {
  await Users.findOne({ Username: req.params.Username })
    .select("Username Email Birthday favoriteMovies createdAt updatedAt Role")
    .populate("favoriteMovies")
    .exec()
    .then(user => {
      if (user) {
        res.status(200).json(user)
      } else {
        res.status(404).send("User not found")
      }
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

// Add favorite movies to user favorite movies array list
async function addFavoriteMovie(req, res) {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { favoriteMovies: req.params.MovieID },
  }, { new: true } /** This line makes sure that the updated document is returned **/)
    .select("favoriteMovies")
    .then((updateUdser) => {
      res.json(updateUdser)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

async function getFavoriteMovies(req, res) {
  await Users.findOne({ Username: req.params.Username })
    .select("favoriteMovies")
    .populate("favoriteMovies")
    .exec()
    .then(user => {
      if (user) {
        res.status(200).json(user.favoriteMovies)
      } else {
        res.status(404).send("User not found")
      }
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

// Remove favorite movies from user favorite movies array list
async function removeFavoriteMovie(req, res) {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { favoriteMovies: req.params.MovieID }
  }, { new: true } /** This line makes sure that the updated document is returned **/)
    .then((updateUser) => {
      res.json(updateUser)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

// Update user data
async function updateUser(req, res) {
  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // Check if the user is the same as the one being updated
  if (req.user.Username !== req.params.Username) {
    return res.status(403).send("Permission denied.")
  }
  // Hash the password
  let hashedPassword = Users.hashPassword(req.body.Password);
  
  // Update user data
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set: {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  }, { new: true } /** This line makes sure that the updated document is returned **/)
    .then((updateUser) => {
      res.json(updateUser)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

// Delete user data by username
async function deleteUser(req, res) {
  await Users.findOneAndDelete({ Username: req.params.Username }).then((user) => {
    if (!user) {
      res.status(404).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  }).catch(err => {
    res.status(500).send("Error: " + err)
  });
}

// Reset user password
async function resetPassword(req, res) {
  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // Check if the user is the same as the one being updated
  if (req.user.Username !== req.params.Username) {
    return res.status(403).send("Permission denied.")
  }
    // Hash the password
    let hashedPassword = Users.hashPassword(req.body.Password);
  // Update user data
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set: {
      Password: hashedPassword
    }
  }, { new: true } /** This line makes sure that the updated document is returned **/)
    .then((updateUser) => {
      res.status(200).json(updateUser)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
}

module.exports = {
  getUsers,
  addUser,
  getUserByUsername,
  addFavoriteMovie,
  getFavoriteMovies,
  removeFavoriteMovie,
  updateUser,
  deleteUser,
  resetPassword
};