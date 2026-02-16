import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

/**
 * Hook for using translations in components
 * @returns {object} { t, language, setLanguage, isLoading }
 */
export const useTranslation = () => {
    const context = useContext(LanguageContext);
    
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    
    return context;
};
