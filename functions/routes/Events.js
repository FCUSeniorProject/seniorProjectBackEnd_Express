const express = require('express');
const admin = require('firebase-admin')
const {authenticate} = require('./Authenticate')
const {Timestamp} = require("firebase/firestore");
const router = express.Router();
const cors = require('cors');

router.get('/', authenticate, async (req, res) => {
    const origin = req.headers.origin || '*';

    // 設定 SSE 與 CORS Headers
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': origin, // ⬅️ 指定來源，不能是 *
        'Access-Control-Allow-Credentials': 'true',
    });

    res.flushHeaders(); // 強制傳送 headers

    // 心跳：每 20 秒發送一個 ping
    const keepAlive = setInterval(() => {
        res.write(`event: ping\ndata: {}\n\n`);
    }, 20000);

    const db = admin.firestore(admin.app('DB'));
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    const devices = userDoc.data()?.devices || [];

    // 儲存所有監聽器引用，以便移除
    const unsubscribers = [];

    devices.forEach(async (deviceId) => {
        // 取得現在時間
        // const now = new Date();
        // const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        // const firestoreTimestamp = Timestamp.fromDate(tenDaysAgo);

        //取得歷史資料
        let historyTag = ["heartRate_history", "activityTime_history", "bloodOxygen_history", "calories_history", "sleep_history", "steps_history", "temperature_history"]
        let history = {}

        await Promise.all(historyTag.map(async (tag) => {
            const snapshot = await db.collection("devices").doc(deviceId).collection(tag).orderBy('timestamp' , 'asc').get();
            history[tag] = snapshot.docs.map(doc => doc.data());

            // 傳送個別 history event
            res.write(`event: updateHistory\ndata: ${JSON.stringify({
                deviceId,
                tag,
                data: history[tag],
            })}\n\n`);
        }));

        const unsubscribe = db.collection("devices").doc(deviceId).onSnapshot((doc) => {
            const data = doc.data();

            console.log('Send SSE:', data);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });


        unsubscribers.push(unsubscribe);
    });

    // 當 client 關閉連線時，清除所有監聽器
    req.on('close', () => {
        console.log('🔌 SSE client disconnected');
        clearInterval(keepAlive);
        unsubscribers.forEach(unsub => unsub());
        res.end();
    });
});


module.exports = router;