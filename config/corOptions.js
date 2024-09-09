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

