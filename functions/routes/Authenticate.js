const admin = require("firebase-admin");
const functions = require("firebase-functions");

// 驗證 Firebase ID Token
async function authenticatePost(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {

        const decodedToken = await admin.auth(admin.app('Authentication')).verifyIdToken(idToken);
        req.user = decodedToken; // 解析 Token，存入 req.user
        next();

    } catch (error) {

        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

async function authenticateGet(req, res, next) {

    const idToken = req.query.token;

    try {

        const decodedToken = await admin.auth(admin.app('Authentication')).verifyIdToken(idToken);
        req.user = decodedToken; // 解析 Token，存入 req.user
        next();

    } catch (error) {

        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

module.exports = {authenticatePost , authenticateGet};
