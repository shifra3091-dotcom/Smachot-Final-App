import axiosInstance from './axiosInstance';

export const uiTextsApi = {
    async getUiTextsByLanguage(language: string) {
        const response = await axiosInstance.get(`/api/UiTextDictionary/ByLanguage/${language}`);
        return response.data;
    },

    async getAllUiTexts() {
        const response = await axiosInstance.get('/api/UiTextDictionary/Index');
        return response.data;
    }
};
