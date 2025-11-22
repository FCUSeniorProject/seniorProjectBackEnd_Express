const express = require('express');
const admin = require('firebase-admin')
const router = express.Router();

router.get('/', async (req, res) => {

    const db = admin.firestore(admin.app("DB"));
    const ECGCollection = db.collection("ecg_raw_data")
    const ECGRawData = []

    try {
        for (let i = 0; i <= 30; i++) {
            const dataDoc = ECGCollection.doc(`6280AD6A-FA61-4455-A0AF-3AFA91EB1EAF_batch_${i}`);
            const data = (await dataDoc.get()).data();
            data.dataPoints.forEach((item) => {
                ECGRawData.push(item);
            })
        }
    } catch (e) {
        res.json({
            success: false,
            message: 'Something wrong'
        })
    }

    res.json({
        success: true,
        message: 'Nothing wrong',
        data: ECGRawData
    })
})

module.exports = router;