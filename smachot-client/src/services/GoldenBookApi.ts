import axiosInstance from './axiosInstance';

export interface AddGoldenBookEntryDto {
    eventId: number;
    senderName: string;
    content: string;
}

export interface GoldenBookEntry {
    goldenBookEntryId: number;
    eventId: number;
    senderName: string;
    content: string;
    createdAt: string;
}

export const goldenBookApi = {
    async addEntry(dto: AddGoldenBookEntryDto) {
        const response = await axiosInstance.post('/api/app/GoldenBook', dto);
        return response.data;
    },

    async getEntriesForEvent(eventId: number): Promise<GoldenBookEntry[]> {
        const response = await axiosInstance.get(`/api/app/GoldenBook/event/${eventId}`);
        return response.data;
    },

    async deleteEntry(entryId: number) {
        const response = await axiosInstance.delete(`/api/app/GoldenBook/${entryId}`);
        return response.data;
    }
};
