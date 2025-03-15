const express = require('express');
const db = require('./FirestoreConnect');
const router = express.Router();

router.post('/set' , async (req , res) => {

    let id = req.body.id;
    let name = req.body.name;

    try {

        let doc = await db.collection('users').add({
            id: id,
            name: name
        });

        return res.json(doc);

    } catch (err) {

        console.log(err.message);
        return res.status(500).json(err.message);
    }
})

module.exports = router;