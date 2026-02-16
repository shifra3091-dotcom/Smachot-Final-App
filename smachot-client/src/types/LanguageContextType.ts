import type { Language } from "./Language";
import type { UiTextDictionary } from "./UiTextDictionary";

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
    dictionary: UiTextDictionary;
    isLoading: boolean;
}