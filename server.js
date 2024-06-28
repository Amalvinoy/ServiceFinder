// In your main application file (app.js or server.js)
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const connectDb = require("./config/dbConnection");
const dotenv = require('dotenv').config();
const createError = require('http-errors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/usersRouter');
const authRouter = require('./routes/auth');
const bodyParser = require('body-parser');
const routes = require('./routes/serviceRouter.js');

const app = express();

// Log environment variables to verify
console.log("Google Client ID:", process.env.clientID);
console.log("Google Client Secret:", process.env.clientSecret);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

connectDb();

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

app.use('/profile', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/service', require("./routes/serviceRouter.js"));

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
