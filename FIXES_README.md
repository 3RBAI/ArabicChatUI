# دليل إصلاح أخطاء ArabicChatUI على Vercel

## المشكلة الرئيسية

التطبيق يعرض كود JavaScript الخام بدلاً من واجهة المستخدم بسبب إعدادات Vercel غير الصحيحة.

## الحل السريع (15 دقيقة)

### الخطوة 1: تحديث vercel.json

استبدل محتوى ملف `vercel.json` بالمحتوى التالي:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### الخطوة 2: تحديث api/index.js

استبدل محتوى ملف `api/index.js` بالمحتوى التالي:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  try {
    res.status(200).json({ 
      message: 'ArabicChatUI API is running',
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      note: 'API endpoints will be implemented here'
    });
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
```

### الخطوة 3: إضافة المتغيرات البيئية على Vercel

1. افتح لوحة تحكم Vercel
2. اذهب إلى Settings > Environment Variables
3. أضف المتغيرات التالية:

```
OPENAI_API_KEY=<your-key>
DEEPSEEK_API_KEY=<your-key>
DATABASE_URL=<your-database-url>
POSTGRES_URL=<your-postgres-url>
NODE_ENV=production
```

### الخطوة 4: إعادة النشر

```bash
git add vercel.json api/index.js
git commit -m "fix: إصلاح إعدادات Vercel لتقديم الملفات الثابتة"
git push origin main
```

أو استخدم Vercel CLI:

```bash
vercel --prod
```

## تحسينات إضافية (اختياري)

### تقسيم كود JavaScript

استبدل `vite.config.ts` بالنسخة المحسّنة المرفقة لتقليل حجم ملف JavaScript.

### إصلاح الثغرات الأمنية

```bash
npm audit fix
```

## التحقق من الإصلاح

بعد إعادة النشر، يجب أن:
- ✅ تظهر واجهة المستخدم بشكل صحيح
- ✅ تُحمّل ملفات CSS و JavaScript بدون أخطاء 404
- ✅ يعمل التطبيق بشكل طبيعي

## الدعم

إذا استمرت المشكلة، راجع التقرير الكامل في `ArabicChatUI_Errors_Report.md`
