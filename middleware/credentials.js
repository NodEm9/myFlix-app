/**
 * @name credentials - middleware/credentials.js
 * @description This middleware function sets the Access-Control-Allow-Credentials header to true.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function. 
 * @function credentials - Sets the Access-Control-Allow-Credentials header to true.
 */
const allowedOrigins = require('../config/allowedOrign.js');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  next();
}

module.exports = credentials