const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const testDBRouter = require('./routes/testDB');
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
    origin: false,
    credentials: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api' , setAndGetFirestoreRouter);

module.exports = app;
