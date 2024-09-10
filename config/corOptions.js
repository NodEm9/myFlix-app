/**
 * This file is used to define the allowed origins for the CORS policy.
 * @module corsOptions 
 * @exports corsOptions  
 * @function corsOptions 
 * @param {string} origin - The origin of the request.
 * @param {function} callback - The callback function.
 * @returns {function} - The callback function.
 */
const allowedOrigins = require("./allowedOrign.js");

const corsOptions = (origin, callback) => {
  if (allowedOrigins.indexOf(origin) === -1) {
    callback(null, true);
  } else {
    const msg = "This site is not an allowed origin";
    callback(new Error(msg), false);
  } 
};

module.exports = corsOptions;

