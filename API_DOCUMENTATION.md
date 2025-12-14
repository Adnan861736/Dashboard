# 📡 توثيق API - منصة تعزيز الوعي المجتمعي

## 🔗 Base URL
```
http://localhost:5000
```

---

## 🔐 Authentication

جميع الـ endpoints المحمية تتطلب إضافة Token في الـ Header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Authentication Endpoints

### 1. تسجيل مستخدم جديد
```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "user",
    "points": 0
  }
}
```

---

### 2. تسجيل الدخول
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "admin",
    "points": 150
  }
}
```

---

### 3. عرض الملف الشخصي
```http
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "admin",
    "points": 150,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## 👥 Users Endpoints

### 1. جميع المستخدمين (Admin)
```http
GET /api/users
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-1",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "admin",
      "points": 150,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "name": "فاطمة أحمد",
      "email": "fatima@example.com",
      "role": "user",
      "points": 85,
      "createdAt": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

---

### 2. مستخدم معين
```http
GET /api/users/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "admin",
    "points": 150,
    "readArticles": 10,
    "completedSurveys": 5,
    "attendedSessions": 3
  }
}
```

---

### 3. لوحة الصدارة (Public)
```http
GET /api/users/leaderboard
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-1",
      "name": "أحمد محمد",
      "points": 150,
      "rank": 1
    },
    {
      "id": "uuid-2",
      "name": "فاطمة أحمد",
      "points": 85,
      "rank": 2
    }
  ]
}
```

---

### 4. حذف مستخدم (Admin)
```http
DELETE /api/users/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 📝 Articles Endpoints

### 1. جميع المقالات (Public)
```http
GET /api/articles
```

**Query Parameters:**
- `category` (optional): تصفية حسب التصنيف
- `limit` (optional): عدد النتائج
- `offset` (optional): تخطي النتائج

**Response (200):**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "أهمية الوعي المجتمعي",
      "content": "محتوى المقال...",
      "category": {
        "id": "cat-uuid",
        "name": "الصحة العامة"
      },
      "author": {
        "id": "user-uuid",
        "name": "أحمد محمد"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 25
}
```

---

### 2. إنشاء مقال (Admin)
```http
POST /api/articles
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "أهمية الوعي المجتمعي",
  "content": "محتوى المقال الكامل هنا...",
  "categoryId": "category-uuid"
}
```

**Response (201):**
```json
{
  "message": "Article created successfully",
  "article": {
    "id": "uuid",
    "title": "أهمية الوعي المجتمعي",
    "content": "محتوى المقال...",
    "categoryId": "category-uuid"
  }
}
```

---

### 3. تحديث مقال (Admin)
```http
PUT /api/articles/:id
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "عنوان محدث",
  "content": "محتوى محدث..."
}
```

---

### 4. حذف مقال (Admin)
```http
DELETE /api/articles/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Article deleted successfully"
}
```

---

### 5. تسجيل قراءة مقال (+5 نقاط)
```http
POST /api/articles/:id/read
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Article marked as read",
  "pointsEarned": 5,
  "totalPoints": 155
}
```

---

## 📋 Surveys Endpoints

### 1. استبيان حسب المقال
```http
GET /api/surveys/article/:articleId
```

**Response (200):**
```json
{
  "survey": {
    "id": "survey-uuid",
    "title": "اختبار الوعي المجتمعي",
    "articleId": "article-uuid",
    "questions": [
      {
        "id": "q1-uuid",
        "questionText": "ما هو الوعي المجتمعي؟",
        "options": [
          {
            "id": "opt1-uuid",
            "optionText": "فهم القضايا المجتمعية",
            "isCorrect": true
          },
          {
            "id": "opt2-uuid",
            "optionText": "عدم الاهتمام بالمجتمع",
            "isCorrect": false
          }
        ]
      }
    ]
  }
}
```

---

### 2. إنشاء استبيان (Admin)
```http
POST /api/surveys
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "articleId": "article-uuid",
  "title": "اختبار الوعي المجتمعي",
  "questions": [
    {
      "questionText": "ما هو الوعي المجتمعي؟",
      "options": [
        {
          "optionText": "فهم القضايا المجتمعية",
          "isCorrect": true
        },
        {
          "optionText": "عدم الاهتمام",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Survey created successfully",
  "survey": {
    "id": "survey-uuid",
    "title": "اختبار الوعي المجتمعي"
  }
}
```

---

### 3. إرسال إجابات (+10 نقاط عند 70%+)
```http
POST /api/surveys/:id/submit
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "answers": [
    {
      "questionId": "q1-uuid",
      "optionId": "opt1-uuid"
    },
    {
      "questionId": "q2-uuid",
      "optionId": "opt3-uuid"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Survey submitted successfully",
  "score": 75,
  "passed": true,
  "pointsEarned": 10,
  "totalPoints": 165,
  "correctAnswers": 3,
  "totalQuestions": 4
}
```

---

## 🎮 Games Endpoints

### 1. جميع الألعاب
```http
GET /api/games
```

**Response (200):**
```json
{
  "games": [
    {
      "id": "game-uuid",
      "title": "كلمات متقاطعة - الوعي المجتمعي",
      "type": "crossword",
      "difficulty": "medium"
    }
  ]
}
```

---

### 2. إكمال لعبة (+15 نقطة)
```http
POST /api/games/:id/complete
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "score": 85,
  "completionTime": 300
}
```

**Response (200):**
```json
{
  "message": "Game completed",
  "pointsEarned": 15,
  "totalPoints": 180
}
```

---

## 🗳 Polls Endpoints

### 1. جميع استطلاعات الرأي
```http
GET /api/polls
```

**Response (200):**
```json
{
  "polls": [
    {
      "id": "poll-uuid",
      "question": "ما رأيك في أهمية الوعي المجتمعي؟",
      "options": ["مهم جداً", "مهم", "متوسط", "غير مهم"],
      "endDate": "2025-12-31T23:59:59.000Z",
      "isActive": true
    }
  ]
}
```

---

### 2. التصويت (+5 نقاط)
```http
POST /api/polls/:id/vote
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "option": "مهم جداً"
}
```

**Response (200):**
```json
{
  "message": "Vote recorded",
  "pointsEarned": 5,
  "totalPoints": 185
}
```

---

### 3. نتائج استطلاع
```http
GET /api/polls/:id/results
```

**Response (200):**
```json
{
  "results": {
    "totalVotes": 150,
    "options": {
      "مهم جداً": {
        "votes": 90,
        "percentage": 60
      },
      "مهم": {
        "votes": 45,
        "percentage": 30
      },
      "متوسط": {
        "votes": 10,
        "percentage": 6.67
      },
      "غير مهم": {
        "votes": 5,
        "percentage": 3.33
      }
    }
  }
}
```

---

## 💬 Discussion Sessions Endpoints

### 1. جميع الجلسات
```http
GET /api/discussions
```

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "title": "جلسة حوارية حول الوعي المجتمعي",
      "description": "مناقشة أهمية الوعي...",
      "meetLink": "https://meet.google.com/abc-defg-hij",
      "scheduledDate": "2025-12-01T15:00:00.000Z",
      "duration": 120,
      "attendeesCount": 25
    }
  ]
}
```

---

### 2. تسجيل حضور (+20 نقطة)
```http
POST /api/discussions/:id/attend
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Attendance marked",
  "pointsEarned": 20,
  "totalPoints": 205
}
```

---

## 📁 Categories Endpoints

### 1. جميع التصنيفات
```http
GET /api/categories
```

**Response (200):**
```json
{
  "categories": [
    {
      "id": "cat-uuid",
      "name": "الصحة العامة",
      "description": "مقالات عن الصحة والوقاية"
    }
  ]
}
```

---

### 2. إنشاء تصنيف (Admin)
```http
POST /api/categories
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "الصحة العامة",
  "description": "مقالات عن الصحة والوقاية"
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Article not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 🏆 نظام النقاط

| الإجراء | النقاط |
|---------|--------|
| قراءة مقال | +5 |
| إكمال استبيان (70%+) | +10 |
| إكمال لعبة | +15 |
| التصويت في استطلاع | +5 |
| حضور جلسة حوارية | +20 |

---

## 📌 ملاحظات مهمة

1. جميع التواريخ بصيغة ISO 8601
2. الـ IDs هي UUIDs
3. Token ينتهي بعد 24 ساعة
4. النقاط تُمنح مرة واحدة فقط لكل إجراء
5. الـ Pagination متاح على جميع endpoints القوائم

---

**Happy Coding! 🚀**
