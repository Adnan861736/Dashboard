# Games API Documentation

## نظرة عامة
هذا التوثيق يشرح كيفية استخدام API للألعاب التعليمية في تطبيق Zenobia.

## Base URL
```
{{baseUrl}}/api/games
```

---

## 1. إنشاء لعبة جديدة (Create Game)

### Endpoint
```
POST /api/games
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
أو
Content-Type: multipart/form-data (عند رفع صورة)
```

---

### أ) لعبة البازل (Puzzle)

#### Request Body (JSON)
```json
{
  "type": "puzzle",
  "title": "بازل - القيم المجتمعية",
  "content": {
    "pieces": 9,
    "difficulty": "medium",
    "description": "قم بترتيب قطع البازل لتكوين صورة تعبر عن القيم المجتمعية"
  },
  "educationalMessage": "صورة تعبر عن القيم المجتمعية",
  "pointsReward": 20
}
```

#### Request Body (Form-Data with Image)
```
type: puzzle
title: بازل - القيم المجتمعية
content: {"pieces": 9, "difficulty": "medium", "description": "قم بترتيب قطع البازل لتكوين صورة تعبر عن القيم المجتمعية"}
educationalMessage: صورة تعبر عن القيم المجتمعية
pointsReward: 20
image: [اختر صورة البازل من جهازك] (JPEG, PNG, GIF)
```

#### Response
```json
{
  "_id": "game123",
  "type": "puzzle",
  "title": "بازل - القيم المجتمعية",
  "content": {
    "pieces": 9,
    "difficulty": "medium",
    "description": "قم بترتيب قطع البازل لتكوين صورة تعبر عن القيم المجتمعية"
  },
  "educationalMessage": "صورة تعبر عن القيم المجتمعية",
  "pointsReward": 20,
  "image": "https://example.com/uploads/puzzle-image.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### ب) لعبة الكلمات المتقاطعة (Crossword)

#### Request Body (JSON)
```json
{
  "type": "crossword",
  "title": "كلمات متقاطعة - الوعي المجتمعي",
  "content": {
    "words": [
      {
        "number": 1,
        "direction": "across",
        "question": "ما هو المصطلح الذي يعني المساهمة الفعالة في حل القضايا المجتمعية؟",
        "answer": "مشاركة",
        "position": {
          "row": 0,
          "col": 0
        }
      },
      {
        "number": 2,
        "direction": "down",
        "question": "ما هي الصفة التي تعبر عن فهم احتياجات ومشاعر الآخرين؟",
        "answer": "تعاطف",
        "position": {
          "row": 0,
          "col": 3
        }
      },
      {
        "number": 3,
        "direction": "across",
        "question": "ما هو العمل الذي يُقدم دون مقابل مادي لخدمة المجتمع؟",
        "answer": "تطوع",
        "position": {
          "row": 2,
          "col": 1
        }
      }
    ]
  },
  "educationalMessage": "أحسنت! الوعي المجتمعي يبدأ بالمشاركة والتعاطف والتطوع",
  "pointsReward": 15
}
```

#### Response
```json
{
  "_id": "game124",
  "type": "crossword",
  "title": "كلمات متقاطعة - الوعي المجتمعي",
  "content": {
    "words": [
      {
        "number": 1,
        "direction": "across",
        "question": "ما هو المصطلح الذي يعني المساهمة الفعالة في حل القضايا المجتمعية؟",
        "answer": "مشاركة",
        "position": { "row": 0, "col": 0 }
      },
      {
        "number": 2,
        "direction": "down",
        "question": "ما هي الصفة التي تعبر عن فهم احتياجات ومشاعر الآخرين؟",
        "answer": "تعاطف",
        "position": { "row": 0, "col": 3 }
      },
      {
        "number": 3,
        "direction": "across",
        "question": "ما هو العمل الذي يُقدم دون مقابل مادي لخدمة المجتمع؟",
        "answer": "تطوع",
        "position": { "row": 2, "col": 1 }
      }
    ]
  },
  "educationalMessage": "أحسنت! الوعي المجتمعي يبدأ بالمشاركة والتعاطف والتطوع",
  "pointsReward": 15,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 2. الحصول على جميع الألعاب (Get All Games)

### Endpoint
```
GET /api/games
```

### Query Parameters (اختياري)
```
?type=puzzle          # فلترة حسب نوع اللعبة
?limit=10            # عدد النتائج
?page=1              # رقم الصفحة
```

### Response
```json
{
  "games": [
    {
      "_id": "game123",
      "type": "puzzle",
      "title": "بازل - القيم المجتمعية",
      "pointsReward": 20,
      "image": "https://example.com/uploads/puzzle-image.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "game124",
      "type": "crossword",
      "title": "كلمات متقاطعة - الوعي المجتمعي",
      "pointsReward": 15,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "totalPages": 1
}
```

---

## 3. الحصول على لعبة محددة (Get Single Game)

### Endpoint
```
GET /api/games/{{gameId}}
```

### Example
```
GET /api/games/game123
```

### Response
```json
{
  "_id": "game123",
  "type": "puzzle",
  "title": "بازل - القيم المجتمعية",
  "content": {
    "pieces": 9,
    "difficulty": "medium",
    "description": "قم بترتيب قطع البازل لتكوين صورة تعبر عن القيم المجتمعية"
  },
  "educationalMessage": "صورة تعبر عن القيم المجتمعية",
  "pointsReward": 20,
  "image": "https://example.com/uploads/puzzle-image.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 4. تعديل لعبة (Update Game)

### Endpoint
```
PUT /api/games/{{gameId}}
```

### Example
```
PUT /api/games/game123
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
أو
Content-Type: multipart/form-data (عند رفع صورة جديدة)
```

### Request Body - تعديل البازل (JSON)
```json
{
  "title": "بازل - القيم المجتمعية المحدث",
  "content": {
    "pieces": 12,
    "difficulty": "hard",
    "description": "قم بترتيب قطع البازل لتكوين صورة تعبر عن القيم المجتمعية"
  },
  "educationalMessage": "رائع! صورة تعبر عن القيم المجتمعية",
  "pointsReward": 25
}
```

### Request Body - تعديل الكلمات المتقاطعة (JSON)
```json
{
  "title": "كلمات متقاطعة - الوعي المجتمعي المحدث",
  "content": {
    "words": [
      {
        "number": 1,
        "direction": "across",
        "question": "ما هو المصطلح الذي يعني المساهمة الفعالة في حل القضايا المجتمعية؟",
        "answer": "مشاركة",
        "position": {
          "row": 0,
          "col": 0
        }
      },
      {
        "number": 2,
        "direction": "down",
        "question": "ما هي الصفة التي تعبر عن فهم احتياجات ومشاعر الآخرين؟",
        "answer": "تعاطف",
        "position": {
          "row": 0,
          "col": 3
        }
      }
    ]
  },
  "educationalMessage": "ممتاز! الوعي المجتمعي يبدأ بالمشاركة والتعاطف",
  "pointsReward": 20
}
```

### Response
```json
{
  "message": "تم تحديث اللعبة بنجاح",
  "game": {
    "_id": "game123",
    "type": "puzzle",
    "title": "بازل - القيم المجتمعية المحدث",
    "content": {
      "pieces": 12,
      "difficulty": "hard",
      "description": "قم بترتيب قطع البازل لتكوين صورة تعبر عن القيم المجتمعية"
    },
    "educationalMessage": "رائع! صورة تعبر عن القيم المجتمعية",
    "pointsReward": 25,
    "image": "https://example.com/uploads/puzzle-image.jpg",
    "updatedAt": "2025-01-01T01:00:00.000Z"
  }
}
```

---

## 5. حذف لعبة (Delete Game)

### Endpoint
```
DELETE /api/games/{{gameId}}
```

### Example
```
DELETE /api/games/game123
```

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "message": "تم حذف اللعبة بنجاح",
  "gameId": "game123"
}
```

---

## أنواع الألعاب المدعومة

### 1. Puzzle (البازل)
```typescript
{
  type: "puzzle",
  content: {
    pieces: number,        // عدد القطع (4, 9, 16, 25, إلخ)
    difficulty: string,    // "easy" | "medium" | "hard"
    description: string    // وصف اللعبة
  }
}
```

### 2. Crossword (الكلمات المتقاطعة)
```typescript
{
  type: "crossword",
  content: {
    words: [
      {
        number: number,           // رقم الكلمة
        direction: "across" | "down",  // الاتجاه
        question: string,         // السؤال
        answer: string,           // الإجابة
        position: {
          row: number,           // الصف
          col: number            // العمود
        }
      }
    ]
  }
}
```

### 3. Quiz (الاختبار)
```typescript
{
  type: "quiz",
  content: {
    questions: [
      {
        question: string,
        options: string[],
        correctAnswer: number,  // index of correct option
        explanation?: string
      }
    ],
    timeLimit?: number  // بالثواني (اختياري)
  }
}
```

### 4. Memory (لعبة الذاكرة)
```typescript
{
  type: "memory",
  content: {
    pairs: number,        // عدد الأزواج
    cards: [
      {
        id: string,
        content: string,  // نص أو emoji
        match: string     // معرف الزوج المطابق
      }
    ],
    difficulty: "easy" | "medium" | "hard"
  }
}
```

---

## أكواد الأخطاء (Error Codes)

| Code | Description |
|------|-------------|
| 400  | بيانات غير صحيحة (Validation Error) |
| 401  | غير مصرح (Unauthorized) |
| 403  | ممنوع (Forbidden) |
| 404  | اللعبة غير موجودة (Game Not Found) |
| 500  | خطأ في الخادم (Server Error) |

---

## أمثلة على الاستخدام مع Postman

### إنشاء لعبة بازل مع صورة (Form-Data)
1. اختر `POST` method
2. URL: `{{baseUrl}}/api/games`
3. Headers: `Authorization: Bearer <your_token>`
4. Body -> form-data:
   - `type`: `puzzle`
   - `title`: `بازل - القيم المجتمعية`
   - `content`: `{"pieces": 9, "difficulty": "medium", "description": "قم بترتيب قطع البازل"}`
   - `educationalMessage`: `صورة تعبر عن القيم المجتمعية`
   - `pointsReward`: `20`
   - `image`: [اختر ملف]

### إنشاء لعبة كلمات متقاطعة (JSON)
1. اختر `POST` method
2. URL: `{{baseUrl}}/api/games`
3. Headers:
   - `Authorization: Bearer <your_token>`
   - `Content-Type: application/json`
4. Body -> raw -> JSON: استخدم مثال JSON أعلاه

### تعديل لعبة
1. اختر `PUT` method
2. URL: `{{baseUrl}}/api/games/game123`
3. Headers: نفس headers الإنشاء
4. Body: البيانات المراد تعديلها فقط

### حذف لعبة
1. اختر `DELETE` method
2. URL: `{{baseUrl}}/api/games/game123`
3. Headers: `Authorization: Bearer <your_token>`

---

## ملاحظات مهمة

1. **التوثيق (Authentication)**: جميع العمليات تتطلب توكن Bearer في الـ Header
2. **رفع الصور**: يجب استخدام `multipart/form-data` عند رفع صور
3. **الترميز (Encoding)**: جميع البيانات تدعم UTF-8 للغة العربية
4. **التحقق (Validation)**: يتم التحقق من صحة البيانات على مستوى Backend
5. **الأحجام**: الحد الأقصى لحجم الصورة يُحدد في Backend (عادةً 5MB)

---

## مثال كامل للعبة كلمات متقاطعة متطورة

```json
{
  "type": "crossword",
  "title": "كلمات متقاطعة - التربية المدنية",
  "content": {
    "words": [
      {
        "number": 1,
        "direction": "across",
        "question": "نظام الحكم القائم على سلطة الشعب",
        "answer": "ديمقراطية",
        "position": { "row": 0, "col": 0 }
      },
      {
        "number": 2,
        "direction": "down",
        "question": "الوثيقة التي تحدد حقوق وواجبات المواطنين",
        "answer": "دستور",
        "position": { "row": 0, "col": 0 }
      },
      {
        "number": 3,
        "direction": "across",
        "question": "عملية اختيار الممثلين في البرلمان",
        "answer": "انتخابات",
        "position": { "row": 3, "col": 2 }
      },
      {
        "number": 4,
        "direction": "down",
        "question": "التزام بقواعد وقوانين المجتمع",
        "answer": "مواطنة",
        "position": { "row": 1, "col": 5 }
      },
      {
        "number": 5,
        "direction": "across",
        "question": "المبدأ الذي يضمن عدم التمييز بين المواطنين",
        "answer": "عدالة",
        "position": { "row": 5, "col": 1 }
      }
    ]
  },
  "educationalMessage": "رائع! أنت الآن تفهم أساسيات التربية المدنية والمشاركة المجتمعية",
  "pointsReward": 25
}
```
