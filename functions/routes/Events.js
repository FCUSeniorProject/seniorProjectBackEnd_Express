const express = require('express');
const admin = require('firebase-admin')
const {authenticate} = require('./Authenticate')
const router = express.Router();
const cors = require('cors');
const {Timestamp} = require("firebase-admin/firestore");

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
    // 連線建立Message
    res.write(`event: SSEConnected\ndata: {}\n\n`);

    const db = admin.firestore(admin.app('DB'));
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    const devices = userDoc.data()?.devices || [];

    // 儲存所有監聽器引用，以便移除
    const unsubscribers = [];

    for(const deviceId of devices){
        // 取得現在時間
        // const now = new Date();
        // const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        // const firestoreTimestamp = Timestamp.fromDate(tenDaysAgo);

        const unsubscribe = db.collection("devices").doc(deviceId).onSnapshot((doc) => {
            const data = doc.data();

            console.log('Send SSE:', data);
            res.write(`event: updateData\ndata: ${JSON.stringify(data)}\n\n`);
        });

        unsubscribers.push(unsubscribe);
    }

    // 當 client 關閉連線時，清除所有監聽器
    req.on('close', () => {
        console.log('🔌 SSE client disconnected');
        clearInterval(keepAlive);
        unsubscribers.forEach(unsub => unsub());
        res.end();
    });
});

router.get('/v2', authenticate, (req, res) => {
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
    // 連線建立Message
    res.write(`event: SSEConnected\ndata: {}\n\n`);

    const db = admin.firestore(admin.app('DB'));
    // 儲存所有監聽器引用，以便移除
    const unsubscribers = [];
    const timestamp = Timestamp.now();
    const templateData = {
        activityTime_current: 0,
        activityTime_goal: 0,
        activityTime_timestamp: timestamp,
        address: '',
        address_lat: 0,
        address_lng: 0,
        batteryLevel: 0,
        bloodOxygen_current: 0,
        bloodOxygen_timestamp: timestamp,
        calories_current: 0,
        calories_goal: 0,
        calories_timestamp: timestamp,
        heartRate_current: 0,
        heartRate_timestamp: timestamp,
        id: '75422A8E-C817-4497-8940-3E47FC761DD5',
        lastUpdated: timestamp,
        location_lat: 0,
        location_lng: 0,
        location_timestamp: timestamp,
        model: "",
        name: '張仁維',
        status: "normal",
        steps_current: 0,
        steps_goal: 0,
        steps_timestamp: timestamp,
        temperature_current: 0,
        temperature_timestamp: timestamp,
        type: "watch"
    };

    const check = (item) => {
        return item.heartRate_current !== 0 &&
               item.steps_current !== 0 &&
               item.activityTime_current !== 0 &&
               item.bloodOxygen_current !== 0 &&
               item.calories_current !== 0
    }

    unsubscribers.push(db.collection('health_data').doc('heartRate').onSnapshot((doc) => {
        const data = doc.data();
        templateData['heartRate_current'] = data.latestValue;
        templateData['heartRate_timestamp'] = data.lastUpdated;

        if (check(templateData)) {
            res.write(`event: updateData\ndata: ${JSON.stringify(templateData)}\n\n`);
        }
    }))

    unsubscribers.push(db.collection('health_data').doc('steps').onSnapshot((doc) => {
        const data = doc.data();
        templateData['steps_current'] = data.latestValue;
        templateData['steps_timestamp'] = data.lastUpdated;

        if (check(templateData)) {
            res.write(`event: updateData\ndata: ${JSON.stringify(templateData)}\n\n`);
        }
    }))

    unsubscribers.push(db.collection('health_data').doc('activityTime_history').onSnapshot((doc) => {
        const data = doc.data();
        templateData['activityTime_current'] = data.latestValue;
        templateData['activityTime_timestamp'] = data.lastUpdated;

        if (check(templateData)) {
            res.write(`event: updateData\ndata: ${JSON.stringify(templateData)}\n\n`);
        }
    }))

    unsubscribers.push(db.collection('health_data').doc('bloodOxygen_history').onSnapshot((doc) => {
        const data = doc.data();
        templateData['bloodOxygen_current'] = data.latestValue;
        templateData['bloodOxygen_timestamp'] = data.lastUpdated;

        if (check(templateData)) {
            res.write(`event: updateData\ndata: ${JSON.stringify(templateData)}\n\n`);
        }
    }))

    unsubscribers.push(db.collection('health_data').doc('calories_history').onSnapshot((doc) => {
        const data = doc.data();
        templateData['calories_current'] = data.latestValue;
        templateData['calories_timestamp'] = data.lastUpdated;

        if (check(templateData)) {
            res.write(`event: updateData\ndata: ${JSON.stringify(templateData)}\n\n`);
        }
    }))

    // 當 client 關閉連線時，清除所有監聽器
    req.on('close', () => {
        console.log('🔌 SSE client disconnected');
        clearInterval(keepAlive);
        unsubscribers.forEach(unsub => unsub());
        res.end();
    });
})


module.exports = router;