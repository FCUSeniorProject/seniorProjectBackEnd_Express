const express = require('express');
const admin = require('firebase-admin')
const router = express.Router();

router.get('/', async (req, res) => {

    const db = admin.firestore(admin.app("DB"));
    const ECGCollection = db.collection("ecg_raw_data")
    const ECGRawData = []

    try {
        for (let i = 0; i <= 30; i++) {
            const dataDoc = ECGCollection.doc(`0CA0AED9-810E-43DE-97A1-C21B6CA275EB_batch_${i}`);
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