import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../types/Language';
import '../styles/LanguageSelector.css';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useTranslation();

    const languages: { code: Language; name: string; flag: string }[] = [
        { code: 'he', name: 'עברית', flag: '🇮🇱' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    ];

    return (
        <div className="language-selector">
            <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="language-select"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
                
            </select>
        </div>
    );
};
