const express = require('express');
const admin = require('firebase-admin')
const {FieldValue, Timestamp} = require('firebase-admin/firestore')
const {authenticate} = require('./Authenticate')

const router = express.Router();

// router.get('/' , authenticate , (res , req) => {
//
// })

router.post('/' , authenticate , async (req, res) => {

    //檢查Body欄位是否完整
    const deviceId = req.body.deviceId;
    const deviceName = req.body.deviceName;
    const deviceAddress = req.body.deviceAddress;

    if (!(deviceId && deviceName && deviceAddress)) {
        return res.json({success: false, message: "Unknown ID , Name or Address"});
    }

    const db = admin.firestore(admin.app('DB'));

    console.log('檢查裝置')

    //檢查裝置是否存在
    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if(deviceDoc.exists) {
            return res.status(403).json({success: false, message: "DeviceID is already exist"});
        }
    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    console.log('寫入')

    //裝置ID寫入user文件
    try {
        const uid = req.user.uid;
        const userDoc = db.collection('users').doc(uid);
        await userDoc.update({
            devices: FieldValue.arrayUnion(deviceId)
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    console.log('寫入devices')

    //新增文件至devices
    try {
        const timestamp = Timestamp.now();
        const deviceDoc = db.collection('devices').doc(deviceId);
        await deviceDoc.set({
            activityTime_current: 0,
            activityTime_goal: 0,
            activityTime_timestamp: timestamp,
            address: deviceAddress,
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
            location_lat: 0,
            location_lng: 0,
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

        const activityTime_history = db.collection('devices').doc(deviceId).collection("activityTime_history");
        await activityTime_history.add({
            minutes: 0,
            timestamp: timestamp
        })

        const bloodOxygen_history = db.collection('devices').doc(deviceId).collection("bloodOxygen_history");
        await bloodOxygen_history.add({
            value: 0,
            timestamp: timestamp
        })

        const calories_history  = db.collection('devices').doc(deviceId).collection("calories_history");
        await calories_history.add({
            count: 0,
            timestamp: timestamp
        })

        const heartRate_history  = db.collection('devices').doc(deviceId).collection("heartRate_history");
        await heartRate_history.add({
            value: 0,
            timestamp: timestamp
        })

        const steps_history   = db.collection('devices').doc(deviceId).collection("steps_history");
        await steps_history.add({
            count: 0,
            timestamp: timestamp
        })

        const temperature_history   = db.collection('devices').doc(deviceId).collection("temperature_history");
        await temperature_history.add({
            value: 0,
            timestamp: timestamp
        })

    } catch (e) {
        return res.status(500).json({success: false, message: "Something wrong"});
    }

    return res.status(200).json({success:true, message: "Nothing wrong"});
})

module.exports = router;