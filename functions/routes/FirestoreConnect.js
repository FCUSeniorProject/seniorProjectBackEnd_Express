const express = require('express');
const admin = require('firebase-admin')
const serviceAccount = require("./keys/seniorproject-1-c6174-firebase-adminsdk-fbsvc-5e25b5d9ee.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;