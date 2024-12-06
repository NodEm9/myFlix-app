const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const movieSchema = mongoose.Schema({
  Title: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true 
  },
  Genre: {
    name: String,
    description: String
  },
  Director: {
    name: String,
    bio: String,
    birthyear: Date
  },
  Actor: [
    { name: String }
  ],
  ReleaseDate: Date,
  ImageUrl: String,
  Rating: Number,
  Featured: Boolean
});


const userSchema = mongoose.Schema({
  Username: {
    type: String, 
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  Birthday: {
    type: Date,
    required: true
  },
  Role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  isVerified: {
    type: Boolean,
    default: false
},
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};  

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
 };

// Create models for the movies and users
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model("users", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;