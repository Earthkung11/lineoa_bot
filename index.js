const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@line/bot-sdk');
const axios = require('axios');

const app = express();
const fs = require('fs');
// LINE Messaging API Configuration
const config = {
    channelAccessToken: 'MckDCck74DTseEnOtUFlqU3vKfAdSQ+Y2jtCsrpDt0H3FvgpQhCB1wVaElM57bzVUAlnJX93Fa/asZdOvdfKw6IvCXgTCNBbBE8BVfiywBDWXz+pkUvqGFtyVRObsB5t0rlxFQ66jZupRJqOn+A5MAdB04t89/1O/w1cDnyilFU=', // ใส่ Access Token ของคุณ
    channelSecret: '4f210738fbe6f75c026a0d640cf9af16',           // ใส่ Channel Secret ของคุณ
};

const client = new Client(config);

app.use(bodyParser.json());

// Webhook Route
app.post('/reg-graduate/lineoa', async (req, res) => {
    try {
        const events = req.body.events;

        for (let event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text; // ข้อความจากผู้ใช้
                const replyToken = event.replyToken;

                // ดึงข้อมูลจาก API PHP
                const data = await getDataFromAPI(userMessage);

                if (!data) {
                    await client.replyMessage(replyToken, {
                        type: 'text',
                        text: 'ไม่พบข้อมูลบุคลากรที่คุณค้นหา'
                    });
                    continue; // ข้ามไปยัง event ถัดไป
                }

                // สร้างข้อความ Flex ตามข้อมูลที่ได้รับ
                const flexMessage = {
                    "type": "flex",
                    "altText": "ข้อมูลบุคลากร",
                    "contents": {
                        "type": "bubble",
                        "direction": "ltr",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "ข้อมูลบุคลากร",
                                    "weight": "bold",
                                    "size": "lg",
                                    "align": "center"
                                }
                            ]
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "md",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "ชื่อ-สกุล:",
                                            "size": "sm",
                                            "color": "#555555",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": data.name || "-",
                                            "size": "sm",
                                            "color": "#111111",
                                            "flex": 2
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "Name:",
                                            "size": "sm",
                                            "color": "#555555",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": data.name_eng || "-",
                                            "size": "sm",
                                            "color": "#111111",
                                            "flex": 2
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "E-mail:",
                                            "size": "sm",
                                            "color": "#555555",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": data.mail || "-",
                                            "size": "sm",
                                            "color": "#111111",
                                            "flex": 2
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "สังกัด:",
                                            "size": "sm",
                                            "color": "#555555",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": data.faculty || "-",
                                            "size": "sm",
                                            "color": "#111111",
                                            "flex": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                };

                // ตอบกลับผู้ใช้
                await client.replyMessage(replyToken, flexMessage);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});

// Function ดึงข้อมูลจาก API PHP
async function getDataFromAPI(query) {
    try {
        // เรียกใช้งาน API PHP ผ่าน axios
        const response = await axios.post('https://app2.neu.ac.th/reg-graduate/API.php', { query });

        // เช็คว่า API ส่งข้อมูลกลับมาไหม
        if (response.data && !response.data.error) {
            return response.data;  // ส่งข้อมูลกลับไป
        } else {
            console.error('Error from API:', response.data.error);
            return null;
        }
    } catch (error) {
        console.error('Error while calling API:', error.message);
        return null;
    }
}


// อ่านไฟล์ที่มีข้อความภาษาไทย
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data); // ข้อความที่อ่านออกมาในรูปแบบ UTF-8
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
