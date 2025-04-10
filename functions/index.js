const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const functions = require('firebase-functions')
const session = require('express-session');
const cors = require('cors');
const admin = require('firebase-admin')

let firebaseInitialized = false;
function initializeFirebaseAdmin() {
    if (!firebaseInitialized) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIRESTORE_PROJECT_ID,
                clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
                privateKey: process.env.FIRESTORE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        firebaseInitialized = true;
    }
}

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
app.use((req, res, next) => {
    initializeFirebaseAdmin();
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api' , setAndGetFirestoreRouter);

console.log('Server start');

exports.app = functions.https.onRequest({secrets: [
        "FIRESTORE_PROJECT_ID",
        "FIRESTORE_CLIENT_EMAIL",
        "FIRESTORE_PRIVATE_KEY"
    ],} , app);
//module.exports = app;