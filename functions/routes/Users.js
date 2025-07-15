const express = require('express');
const {authenticate} = require("./Authenticate");
const admin = require("firebase-admin");
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', authenticate, async (req, res) => {
  const uid = req.user.uid;
  const email = req.user.email;
  const db = admin.firestore(admin.app('DB'));

  try {
    await db.collection('users').doc(uid).set({
      email: email,
      devices: []
    });
  } catch (e) {
    return res.status(500).json({success: false, message: "Something wrong"});
  }

  return res.json({success: true, message: "Nothing wrong"});
})

module.exports = router;
