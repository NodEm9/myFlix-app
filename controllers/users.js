/**
 * @name User Module - Express controller for user endpoints.
 * @module controllers/users 
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
 */

require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB" }); /* eslint no-undef: off */


let Models = require("../model/models.js");
let Users = Models.User;


const { validationResult } = require("express-validator");

/**
 * This method adds data for a new user to our list of users.
 * @method addUser 
 * @param {object} req - Request object
 */
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

/**
 * This method returns the list of all users in the database  
 * @method getUsers
 * @param {object} req - Request object
 */
async function getUsers(req, res) {
  await Users.find()
    .then(users => {
      res.status(200).json(users)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};



/**
 * This method returns data about a single user by username
 * @method getUserByUsername
 * @param {object} req - Request object
 */
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

/**
 * This method adds favorite movies to user favorite movies array list
 * @method addFavoriteMovie
 * @param {object} req - Request object
 */
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

/**
 * This method returns favorite movies from user favorite movies array list
 * @method getFavoriteMovies
 * @param {object} req - Request object
 */
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


/**
 * This method removes favorite movies from user favorite movies array list
 * @method removeFavoriteMovie
 * @param {object} req - Request object
 */
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

/**
 * This method updates user data by username and returns the updated user data
 * @method updateUser
 * @param {object} req - Request object
 */
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

/**
 * This method deletes user data by username and returns a message
 * @method deleteUser
 * @param {object} req - Request object
 */
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


module.exports = {
  getUsers,
  addUser,
  getUserByUsername,
  addFavoriteMovie,
  getFavoriteMovies,
  removeFavoriteMovie,
  updateUser,
  deleteUser,
};