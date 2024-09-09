const allowedOrigins = require("./allowedOrign.js");


const corsOptions = (origin, callback) => {
  if (allowedOrigins.indexOf(origin) === -1 || !origin) {
    const msg = "The CORS policy for this site does not allow access from the specified Origin.";
    return callback(new Error(msg), false);
  }
  return callback(null, true);
};

module.exports = corsOptions;

