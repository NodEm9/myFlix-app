const allowedOrigins = require("./allowedOrign.js");


const corsOptions = (origin, callback) => {
  const msg = "The CORS policy for this site does not allow access from the specified Origin.";
  if (allowedOrigins.indexOf(origin) === -1 || !origin) {
    callback(null, true);
  }
  callback(new Error(msg), false);  
};

module.exports = corsOptions;

