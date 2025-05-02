const express = require('express');
const admin = require('firebase-admin')
const {authenticatePost}  = require('./Authenticate');
const router = express.Router();

router.post('/set' , authenticatePost ,  async (req , res) => {

    let id = req.body.id;
    let HR = req.body.HR;
    const db = admin.firestore(admin.app('DB'));

    try {

        let doc = await db.collection('testdata').doc(id).set({
            HR: HR
        });

        return res.json(doc);

    } catch (err) {

        console.log(err.message);
        return res.status(500).json(err.message);
    }
})

router.post('/get' , authenticatePost , async (req , res) => {

    let id = req.body.id;
    const db = admin.firestore(admin.app('DB'));

    console.log(id)

    try {

        let doc  = await db.collection('testdata').doc(id).get();
        return res.json(doc.data());

    } catch (err) {

        console.log(err.message);
        return res.status(500).json(err.message);
    }
})

module.exports = router;