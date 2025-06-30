const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const functions = require('firebase-functions/v2')
const session = require('express-session');
const cors = require('cors');
const admin = require('firebase-admin')

//----- 初始化 Firebase Admin SDK -----
let firebaseInitialized = false;

function initializeFirebaseAdmin() {

    if (!firebaseInitialized) {

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIRESTORE_PROJECT_ID,
                clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
                privateKey: process.env.FIRESTORE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        } , 'DB');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.AUTHENTICATION_PROJECT_ID,
                clientEmail: process.env.AUTHENTICATION_CLIENT_EMAIL,
                privateKey: process.env.AUTHENTICATION_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        } , 'Authentication');

        firebaseInitialized = true;
    }
}
//----------

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

//----- 功能路由 -----
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/Events')
const devicesRouter = require('./routes/Devices')

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/events' , eventsRouter);
app.use('/api/devices', devicesRouter);
//----------

console.log('Server start');

exports.app = functions.https.onRequest({
    secrets: [
        "FIRESTORE_PROJECT_ID",
        "FIRESTORE_CLIENT_EMAIL",
        "FIRESTORE_PRIVATE_KEY",
        "AUTHENTICATION_PROJECT_ID",
        "AUTHENTICATION_CLIENT_EMAIL",
        "AUTHENTICATION_PRIVATE_KEY"
    ],
    cors: true
} , app);