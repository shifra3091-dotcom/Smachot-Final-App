import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '../types/Language';
import type { LanguageContextType } from '../types/LanguageContextType';
import type { UiTextDictionary } from '../types/UiTextDictionary';

import { uiTextsApi } from '../services/UiTextsApi';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Load language from localStorage or default to Hebrew
        const saved = localStorage.getItem('smachot-language');
        return (saved as Language) || 'default';
        // return (saved as Language) || 'he';

    });
    
    const [dictionary, setDictionary] = useState<UiTextDictionary>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load dictionary when language changes
    useEffect(() => {
        const loadDictionary = async () => {
            setIsLoading(true);
            try {
                const dict = await uiTextsApi.getUiTextsByLanguage(language);
                setDictionary(dict);
            } catch (error) {
                console.error('Failed to load UI texts:', error);
                // Fallback to empty dictionary
                setDictionary({});
            } finally {
                setIsLoading(false);
            }
        };

        loadDictionary();
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('smachot-language', lang);
        
        // Update HTML dir attribute for RTL support
        if (lang === 'he' || lang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    };

    // Translation function
    const t = (key: string, fallback?: string): string => {
        return dictionary[key] || fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dictionary, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
};
