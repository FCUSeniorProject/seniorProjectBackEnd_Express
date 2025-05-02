const express = require('express');
const cors = require('cors');
const {authenticateGet} = require('./Authenticate')
const router = express.Router();

/* GET home page. */
router.get('/', authenticateGet , (req, res) => {
    // 設定 SSE header
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // 傳送初始訊息
    res.write(`data: Connected\n\n`);

    // 模擬每 2 秒推送一次訊息
    const intervalId = setInterval(() => {
        const time = new Date().toLocaleTimeString();
        res.write(`data: Server time is ${time}\n\n`);
    }, 2000);

    // 連線關閉時清除 interval
    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

module.exports = router;