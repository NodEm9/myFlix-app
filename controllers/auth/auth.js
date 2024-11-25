/**
 * Auth Controller
 * @module controllers/auth/auth
 * @description Login to the application
 * @function passport - Passport object
 * @function generateJWTToken - Generate JWT Token
 */
const jwt = require("jsonwebtoken"),
  passport = require("passport");
  
require("./passport.js");

require("dotenv").config();

/**
 * 
 * @param {*} user 
 * @returns 
 * @function generateJWTToken - Generate JWT Token
 * @param {object} user - The user object
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET_KEY, {
    subject: user.Username,
    expiresIn: "1d",
    algorithm: "HS256" 
  }) /* eslint no-undef: off */ 
};

/**
 * Login to the application 
 * @function login
 * @param {object} req - Request object
 */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right.", 
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      })
    })(req, res);
  });
}