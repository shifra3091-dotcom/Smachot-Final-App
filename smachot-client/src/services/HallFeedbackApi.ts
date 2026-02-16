import axiosInstance from './axiosInstance';

export interface FeedbackCategory {
    Id: number;
    Name: string;
}

export interface AddHallFeedbackDto {
    HallId: number;
    EventId: number;
    Category: number;
    TableNumber?: number;
    Content: string;
    Rating: number;
}

export const HallFeedbackApi = {
    // Get all feedback categories
    getFeedbackCategories: async (): Promise<FeedbackCategory[]> => {
        const response = await axiosInstance.get<FeedbackCategory[]>('/api/app/hallfeedback/categories');
        return response.data;
    },

    // Add a new hall feedback
    addFeedback: async (dto: AddHallFeedbackDto): Promise<{ message: string }> => {
        const response = await axiosInstance.post<{ message: string }>('/api/app/hallfeedback', dto);
        return response.data;
    },

    // Get feedbacks for an event
    getFeedbacksForEvent: async (eventId: number) => {
        
        const response = await axiosInstance.get(`/api/app/hallfeedback/event/${eventId}`);
        console.log("!!!!!");
     
        console.log(response.data);
       console.log("!!!!!");
        return response.data;
    },

    // Get categories that exist for a specific event
    getCategoriesForEvent: async (eventId: number) => {
                // const response = await axiosInstance.get<FeedbackCategory[]>(`/api/app/hallfeedback/event/${eventId}/categories`);

        const response = await axiosInstance.get(`/api/app/hallfeedback/event/${eventId}/categories`);
        return response.data;
    },

    // Get feedbacks for a hall
    getFeedbacksForHall: async (hallId: number) => {
        const response = await axiosInstance.get(`/api/app/hallfeedback/hall/${hallId}`);
        return response.data;
    }
};
