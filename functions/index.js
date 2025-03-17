const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const functions = require('firebase-functions')
const session = require('express-session');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const setAndGetFirestoreRouter = require('./routes/SetAndGetFirestore');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true
}));
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api' , setAndGetFirestoreRouter);

console.log('Server start');

exports.app = functions.https.onRequest(app);
//module.exports = app;