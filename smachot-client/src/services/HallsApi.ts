import axiosInstance from './axiosInstance';

export interface CreateHallDto {
    Name: string;
    OwnerName: string;
    Phone: string;
    Email: string;
    Password: string;
    HallAddress: string;
    HallPhone: string;
    AllowedEventTypeIds?: string[];
}

export type CreateHallForm = CreateHallDto & {
    HallImage?: File | null;
};

export const hallsApi = {
    async getHalls() {
        const response = await axiosInstance.get('/api/app/halls');
        return response.data;
    },

    async getHall(id: number) {
        const response = await axiosInstance.get(`/api/app/halls/${id}`);
        return response.data;
    },

    async getEventTypesForHall(hallId: number) {
        const response = await axiosInstance.get(`/api/app/halls/${hallId}/event-types`);
        console.log("getEventTypesForHall", response);
        return response.data;
    },

    
    async createHall(dto: CreateHallDto) {
        const response = await axiosInstance.post('/api/app/halls', dto);
        return response.data;
    },

    async createHallFormData(formData: FormData) {
        const response = await axiosInstance.post('/api/app/halls', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
