const mongoose = require("mongoose");


const db = () => {
  mongoose.connect(process.env.MONGO_URI, { dbName: "movieDB" }); /* eslint no-undef: off */
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Connected to the database");
  });
};

module.exports = db;