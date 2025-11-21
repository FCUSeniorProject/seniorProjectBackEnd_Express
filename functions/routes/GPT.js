const express = require("express");
const OpenAI = require("openai");
const {authenticate} = require("./Authenticate");
const {defineSecret} = require("firebase-functions/params");
const router = express.Router();

router.post('/', async (req, res) => {

    const deviceData = req.body.data;
    const client = new OpenAI({
        apiKey: process.env.GPT_TOKEN,
    });

    const prompt = `
        你將會收到一筆由 Apple Watch 所蒐集的生理數據，資料格式如下：
        {
            "device": 裝置資訊（請忽略）,
            "heartRate": 心率資料，含 current 及歷史紀錄（皆附 timestamp）,
            "bloodOxygen": 血氧資料，含 current 及歷史紀錄,
            "activityTime": 活動時間資料，含 current 及歷史紀錄,
            "distance": 活動距離資料，含 current 及歷史紀錄,
            "standing": 站立時間資料，含 current 及歷史紀錄,
            "steps": 步數資料，含 current 及歷史紀錄,
            "sleep": 睡眠資料（為髒資料，請忽略）,
            "calories": 卡路里資料，含 current 及歷史紀錄
        }
        
        注意事項：
        1. 單位可能不一致，請自行合理判斷。
        2. 請根據數據整體趨勢、當前值與變化情況，提供個人化健康建議。
        3. 忽略所有非健康相關欄位（如 device、sleep）。
        
        ---
        
        請根據輸入的完整資料內容，生成一份**健康建議報表**，須包含資訊摘要以下三個面向，每個建議限 100 個中文字以內，且必須包含實際數據做出說明：
        
        - 飲食（diet）
        - 壓力（stress）
        - 運動（exercise）
        
        輸出格式請嚴格遵循以下 JSON 結構，以下內容為範例資料，**僅輸出 JSON 字串，不得包含其他文字或說明**：
        \`\`\`
        {
          "healthSummary": {
            "heartRate": { "current": 72, "range": "60-100次/分鐘" },
            "bloodOxygen": { "current": 98, "range": "95-100%" }
          },
          "healthAdvice:" {
            "diet": "建議每天食用半磅的各種蔬菜、水果、豐富蛋白質食物，避免過多食用糖類、油膩食物",
            "stress": "建議平衡工作與生活，學習練習壓力管理技能，例如練習幾分鐘每天的練習，例如深呼吸、舒適位置、聆聽喜歡的音樂等",
            "exercise": "建議每天至少30分鐘運動，可以選擇步行、跑咪、運動等活動，並避免長時間坐著或臥在桌上"
          }
        }
        \`\`\`
        
        ---
        
        接下來是輸入資料：
        ${JSON.stringify(deviceData)}
    `;

    const response = await client.responses.create({
        model: "gpt-5",
        input: prompt,
    });


    res.json({data: JSON.parse(response.output_text)})
});

module.exports = router;