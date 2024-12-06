/* eslint-disable no-undef */
const { ExpressValidator } = require("express-validator")
const { default: mongoose } = require("mongoose")
const dotenv = require("dotenv")
dotenv.config();

const errorHandler = (err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    throw new Error(err.message)
  }

  if (err instanceof mongoose.Error.CastError) {
    throw new Error(err.message)
  }

  if(err.message === "jwt malformed") {
    return res.status(401).send("jwt malformed")
  }

  if(err.message === "jwt expired") {
    return res.status(401).send("jwt expired")
  }

  if (err instanceof ExpressValidator) {
    throw new Error(err.message)
  }

  if(process.env.NODE_ENV !== 'production') {
    console.log(err.stack)
  }

  res.status(500).send("Something is broken!")
  next()

}

module.exports = errorHandler