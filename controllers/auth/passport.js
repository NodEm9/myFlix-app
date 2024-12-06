const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('../../model/models.js'),
  passportJwt = require('passport-jwt');

require('dotenv').config();



let Users = Models.User,
  JWTStrategy = passportJwt.Strategy,
  ExtractJWT = passportJwt.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password'
    },
    async (Username, Password, callback) => {
      console.log(`${Username} ${Password}`);
      await Users.findOne({ Username: Username })
        .then((user) => {
          if (!user) {
            return callback(null, false, { message: 'Incorrect username' });
          }
          if (!user.validatePassword(Password)) {
            return callback(null, false, { message: 'Incorrect password' });
          } else {
            return callback(null, user)
          }
        })
        .catch((err) => {
          return callback(err)
        });
    }));

passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY 
  }, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user)
      }).catch((err) => {
        return callback(err)
      }); /* eslint no-undef: off */
  }));