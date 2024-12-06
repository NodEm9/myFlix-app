require("dotenv").config();
const db = require("../config/db.js")
db();

let Models = require("../model/models.js");
let Users = Models.User;

const { validationResult } = require("express-validator");

async function addUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password)

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

async function getUsers(req, res) {
  await Users.find()
    .then(users => {
      res.status(200).json(users)
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

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


async function updateUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (req.user.Username !== req.params.Username) {
    return res.status(403).send("Permission denied.")
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  
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