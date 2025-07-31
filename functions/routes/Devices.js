const express = require('express');
const admin = require('firebase-admin')
const {FieldValue, Timestamp} = require('firebase-admin/firestore')
const {authenticate} = require('./Authenticate')

const router = express.Router();

router.get('/' , authenticate , async (req, res) => {
    const db = admin.firestore(admin.app('DB'));
    const uid = req.user.uid;

    let devices = []
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        devices = userDoc.data()?.devices || [];
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    return res.status(200).json({success: true, message: 'Nothing wrong', data: devices});
})

router.post('/' , authenticate , async (req, res) => {

    //檢查Body欄位是否完整
    const deviceId = req.body.deviceId;
    const deviceName = req.body.deviceName;
    const deviceAddress = req.body.deviceAddress;
    const deviceLat = req.body.deviceLat;
    const deviceLng = req.body.deviceLng;

    if (!(deviceId && deviceName && deviceAddress)) {
        return res.status(400).json({success: false, message: "Unknown ID , Name or Address"});
    }

    const db = admin.firestore(admin.app('DB'));
    const uid = req.user.uid;

    console.log('檢查裝置')

    //檢查裝置是否存在
    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if(deviceDoc.exists) {
            return res.status(400).json({success: false, message: "DeviceID is already exist"});
        }
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    console.log('寫入')

    try {
        const batch = db.batch();

        //寫入users
        const userDoc = db.collection('users').doc(uid);
        batch.update(userDoc, {
            devices: FieldValue.arrayUnion(deviceId)
        });

        //寫入devices
        const timestamp = Timestamp.now();
        const deviceDoc = db.collection('devices').doc(deviceId);
        batch.set(deviceDoc, {
            activityTime_current: 0,
            activityTime_goal: 0,
            activityTime_timestamp: timestamp,
            address: deviceAddress,
            address_lat: deviceLat,
            address_lng: deviceLng,
            batteryLevel: 0,
            bloodOxygen_current: 0,
            bloodOxygen_timestamp: timestamp,
            calories_current: 0,
            calories_goal: 0,
            calories_timestamp: timestamp,
            heartRate_current: 0,
            heartRate_timestamp: timestamp,
            id: deviceId,
            lastUpdated: timestamp,
            location_lat: deviceLat,
            location_lng: deviceLng,
            location_timestamp: timestamp,
            model: "",
            name: deviceName,
            status: "normal",
            steps_current: 0,
            steps_goal: 0,
            steps_timestamp: timestamp,
            temperature_current: 0,
            temperature_timestamp: timestamp,
            type: "watch"
        })

        const activityTime_history = db.collection('devices').doc(deviceId).collection("activityTime_history").doc();
        batch.set(activityTime_history, {
            minutes: 0,
            timestamp: timestamp
        })

        const bloodOxygen_history = db.collection('devices').doc(deviceId).collection("bloodOxygen_history").doc();
        batch.set(bloodOxygen_history, {
            value: 0,
            timestamp: timestamp
        })

        const calories_history  = db.collection('devices').doc(deviceId).collection("calories_history").doc();
        batch.set(calories_history, {
            count: 0,
            timestamp: timestamp
        })

        const heartRate_history  = db.collection('devices').doc(deviceId).collection("heartRate_history").doc();
        batch.set(heartRate_history, {
            value: 0,
            timestamp: timestamp
        })

        const steps_history   = db.collection('devices').doc(deviceId).collection("steps_history").doc();
        batch.set(steps_history, {
            count: 0,
            timestamp: timestamp
        })

        const temperature_history   = db.collection('devices').doc(deviceId).collection("temperature_history").doc();
        batch.set(temperature_history, {
            value: 0,
            timestamp: timestamp
        })

        await batch.commit();
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    return res.status(200).json({success:true, message: "Nothing wrong"});
});

router.put('/:id', authenticate, async  (req, res) => {

    const deviceId = req.params.id;

    if (!deviceId) {
        return res.status(400).json({success: false, message: "Unknown ID"});
    }

    const db = admin.firestore(admin.app('DB'));
    const uid = req.user.uid;

    //檢查裝置是否存在
    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if(!deviceDoc.exists) {
            return res.status(400).json({success: false, message: "DeviceID is not exist"});
        }
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    let devices = []
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        devices = userDoc.data()?.devices || [];
    }  catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    if (devices.find(id => id === deviceId)) {
        try {
            const deviceDoc = db.collection('devices').doc(deviceId);
        } catch (e) {
            return res.status(500).json({success: false, message: "Something wrong"});
        }
    } else {
        return res.status(400).json({success: false, message: "Only owner can delete device"});
    }
})

router.delete('/:id', authenticate, async (req, res) => {

    const deviceId = req.params.id;

    if (!deviceId) {
        return res.status(400).json({success: false, message: "Unknown ID"});
    }

    const db = admin.firestore(admin.app('DB'));
    const uid = req.user.uid;

    //檢查裝置是否存在
    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if(!deviceDoc.exists) {
            return res.status(400).json({success: false, message: "DeviceID is not exist"});
        }
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    let devices = []
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        devices = userDoc.data()?.devices || [];
    }  catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    if (devices.find(id => id === deviceId)) {
        try {
            const batch = db.batch();
            const userDoc = db.collection("users").doc(uid);
            batch.update(userDoc, {
                devices: FieldValue.arrayRemove(deviceId)
            });

            const deviceDoc = db.collection('devices').doc(deviceId);
            batch.delete(deviceDoc);
            await batch.commit();
            return res.json({success: true, message:"Nothing wrong"})
        } catch (e) {
            return res.status(500).json({success: false, message: "Something wrong"});
        }
    } else {
        return res.status(400).json({success: false, message: "Only owner can delete device"});
    }
})

router.get('/history/:id', authenticate, async (req, res) => {

    const deviceId = req.params.id;

    if (!deviceId) {
        return res.status(400).json({success: false, message: "Unknown ID"});
    }

    const db = admin.firestore(admin.app('DB'));

    //檢查裝置是否存在
    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if(!deviceDoc.exists) {
            return res.status(400).json({success: false, message: "DeviceID is not exist"});
        }
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    //取得歷史資料
    let historyTag = ["heartRate_history", "activityTime_history", "bloodOxygen_history", "calories_history", "sleep_history", "steps_history", "temperature_history"]
    let history = {}

    try {
        await Promise.all(historyTag.map(async (tag) => {
            const snapshot = await db.collection("devices").doc(deviceId).collection(tag).orderBy('timestamp', 'asc').get();
            history[tag] = snapshot.docs.map(doc => doc.data());
        }));
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    return res.status(200).json({success:true, message: "Nothing wrong", data: history});
})

module.exports = router;