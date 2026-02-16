# Translation System (מערכת תרגום)

## Overview (סקירה כללית)
This project now supports multi-language translations using a custom implementation connected to your backend API.

הפרויקט תומך כעת בתרגומים לשפות מרובות באמצעות מימוש מותאם המחובר ל-API של ה-backend.

## Supported Languages (שפות נתמכות)
- 🇮🇱 Hebrew (עברית) - `he` - RTL
- 🇺🇸 English - `en` - LTR
- 🇫🇷 French (Français) - `fr` - LTR
- 🇸🇦 Arabic (العربية) - `ar` - RTL
- 🇷🇺 Russian (Русский) - `ru` - LTR

## How to Use (איך להשתמש)

### 1. In Components (בקומפוננטות)

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
    const { t, language, setLanguage, isLoading } = useTranslation();
    
    return (
        <div>
            <h1>{t('page.title', 'Default Title')}</h1>
            <p>{t('page.description', 'Default description')}</p>
            
            {/* Current language */}
            <p>Current language: {language}</p>
            
            {/* Change language */}
            <button onClick={() => setLanguage('en')}>English</button>
            <button onClick={() => setLanguage('he')}>עברית</button>
        </div>
    );
}
```

### 2. Translation Function (פונקציית תרגום)

```tsx
// Basic usage
t('key')

// With fallback text
t('key', 'Default text if key not found')

// Examples
t('welcome.message', 'Welcome!')
t('button.save', 'Save')
t('error.not_found', 'Not Found')
```

### 3. Language Selector Component (קומפוננטת בחירת שפה)

הקומפוננטה `LanguageSelector` כבר מוטמעת ב-`App.tsx` ומופיעה בראש הדף.

```tsx
import { LanguageSelector } from './components/LanguageSelector';

// Already included in App.tsx
<LanguageSelector />
```

## Key Features (תכונות מרכזיות)

### RTL/LTR Support (תמיכה ב-RTL/LTR)
המערכת אוטומטית מעדכנת את כיוון הטקסט:
- עברית וערבית: RTL (ימין לשמאל)
- אנגלית, צרפתית, רוסית: LTR (שמאל לימין)

### Persistent Language Selection (שמירת בחירת שפה)
השפה הנבחרת נשמרת ב-localStorage ונשמרת גם לאחר רענון הדף.

### Loading State (מצב טעינה)
```tsx
const { isLoading } = useTranslation();

if (isLoading) {
    return <div>Loading translations...</div>;
}
```

## API Integration (אינטגרציה עם API)

The system automatically fetches translations from:
```
GET /api/UiTextDictionary/ByLanguage/{language}
```

המערכת טוענת אוטומטית תרגומים מה-API כאשר המשתמש משנה שפה.

## Project Structure (מבנה הפרויקט)

```
src/
├── contexts/
│   └── LanguageContext.tsx      # Context provider
├── hooks/
│   └── useTranslation.ts        # Translation hook
├── components/
│   ├── LanguageSelector.tsx     # Language selector component
│   └── LanguageSelector.css     # Styles
├── types/
│   └── index.ts                 # TypeScript types
└── services/
    └── api.ts                   # API calls
```

## Example: Updating Existing Components (דוגמה: עדכון קומפוננטות קיימות)

Before (לפני):
```tsx
function HallsList() {
    return (
        <div>
            <h1>Halls</h1>
            <p>Loading...</p>
        </div>
    );
}
```

After (אחרי):
```tsx
import { useTranslation } from '../hooks/useTranslation';

function HallsList() {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1>{t('halls.title', 'Halls')}</h1>
            <p>{t('loading', 'Loading...')}</p>
        </div>
    );
}
```

## Backend Requirements (דרישות מה-Backend)

ודא שה-API מחזיר מבנה מילון:
```json
{
    "welcome.message": "Welcome!",
    "button.save": "Save",
    "error.not_found": "Not Found"
}
```

## Notes (הערות)

1. **Keys Naming Convention**: השתמש בנקודות להפרדה (e.g., `page.title`, `button.save`)
2. **Always Provide Fallback**: תמיד ספק טקסט fallback כדי שהאפליקציה תעבוד גם ללא תרגומים
3. **RTL Styling**: וודא שה-CSS תומך ב-RTL (השתמש ב-`start`/`end` במקום `left`/`right` כאשר אפשרי)

## Testing (בדיקות)

1. בחר שפה שונה מהבורר
2. רענן את הדף - השפה צריכה להישאר
3. בדוק שכיוון הטקסט משתנה (RTL/LTR)
4. בדוק שהטקסטים מתעדכנים בכל הקומפוננטות
