require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB" }); /* eslint no-undef: off */


let Models = require("../model/models.js");
let Users = Models.User;

const { validationResult } = require("express-validator");

// Get all users in the database
async function getUsers(req, res) {
  await Users.find()
    .then(users => {
      res.status(200).json(users)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

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

module.exports = {
  getUsers,
  addUser,
  getUserByUsername,
  addFavoriteMovie,
  getFavoriteMovies,
  removeFavoriteMovie,
  updateUser,
  deleteUser
};