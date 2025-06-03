const express = require('express');
const admin = require('firebase-admin')
const {authenticate} = require('./Authenticate')
const router = express.Router();

router.get('/', authenticate , async (req, res) => {
    // 設定 SSE header
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    res.flushHeaders(); // 重要：強制刷新 headers

    if(req.user.uid) {
        const db = admin.firestore(admin.app('DB'));
        let devices = (await db.collection("users").doc("EUiYl3D2C1P6mPd5HH7MFwPoBwg1").get()).data().devices;

        devices.forEach((device) => {
            //監聽裝置數據變化
            let ref = db.collection("devices").doc(device).onSnapshot((doc) => {
                let data = {
                    "device": device,
                    "HR": doc.data().HR
                };
                console.log(data);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            })
        })
    }

    // 連線關閉
    req.on('close', () => {
        res.end();
    });
});

module.exports = router;