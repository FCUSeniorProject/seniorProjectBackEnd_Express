const express = require('express');
const admin = require('firebase-admin')
const {authenticate} = require('./Authenticate')
const router = express.Router();

// router.get('/' , authenticate , (res , req) => {
//
// })