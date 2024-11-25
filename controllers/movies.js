
/**
 * @name Movies Module - Express controller for movie endpoints.
 * @module controllers/movies 
 * @exports getMovies
 * @function getMovies - Get the list of all movies
 * @function getMovieByTitle - Get data about a single movie by title
 * @function getGenreByName - Get data about a genre by name
 * @function getDirectorByName - Get data about a director by name
 */

require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB" }); /* eslint no-undef: off */


let Models = require("../model/models.js");

let Movies = Models.Movie;

/**
 * This medthod returns the list of all movies in the database
 * @method getMovies
 * @param {object} req - Request object
 * 
 */
async function getMovies(req, res) {
  await Movies.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => {
      res.status(500).send("Error: " + err)
    }).finally(() => {
      res.end();
    });
};

/***
 * This method returns data about a single movie by title 
 * @method getMovieByTitle
 * @param {object} req - Request object
 */
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

/**
 * This method returns data about a genre by name 
 * @method getGenreByName
 * @param {object} req - Request object
 */
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

/**
 * This method returns data about a director by name 
 * @method getDirectorByName
 * @param {object} req - Request object
 */
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