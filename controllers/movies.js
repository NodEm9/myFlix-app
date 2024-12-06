require("dotenv").config();
const db = require("../config/db.js")
db();


let Models = require("../model/models.js");

let Movies = Models.Movie;

async function getMovies(req, res) {
  await Movies.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => {
      res.status(500).send("Error: " + err)
    }).finally(() => {
      res.end();
    });
};

async function getMovieByTitle(req, res) {
  await Movies.findOne({ Title: req.params.title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie)
      } else {
        res.status(400).send("Movie not found")
      }
    })
    .catch(err => {
      res.status(500).send("Error: " + err)
    });
};

async function getGenreByName(req, res) {
  await Movies.findOne({ "Genre.name": req.params.genreName })
    .then((genre) => {
      if (genre) {
        res.status(200).json(genre.Genre)
      } else {
        res.status(400).send("Genre not found")
      }
    })
    .catch(err => {
      res.status(500).send("Error: " + err)
    });
};

async function getDirectorByName(req, res) {
  await Movies.findOne({ "Director.name": req.params.directorName })
    .then((director) => {
      if (director) {
        res.status(200).json(director.Director)
      } else {
        res.status(400).send("Director not found")
      }
    }).catch(err => {
      res.status(500).send("Error: " + err)
    });
};

module.exports = {
  getMovies,
  getMovieByTitle,
  getGenreByName,
  getDirectorByName
};