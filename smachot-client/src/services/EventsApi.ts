import axiosInstance from './axiosInstance';
import type { EventType } from '../types/EventType';

export const eventsApi = {
    async getEvents(id: number): Promise<any> {
       
    const response = await axiosInstance.get('/api/app/event/get-event-by-id', {
            params: { 
                eventId: id // השם כאן חייב להיות זהה לשם הפרמטר בשרת
            }});
    
    console.log("response: ", response);
        return response.data;
    },

    async getEventsForUser(userId: number) {
        const response = await axiosInstance.get(`/api/app/event/user/${userId}`);
        return response.data;
    },

    async getEventsForHall(hallId: number) {
        const response = await axiosInstance.get(`/api/app/halls/${hallId}/events`);
        let data = response.data;
        if (Array.isArray(data)) {
            console.log('Data is already an array');
            return data;
        }
        
        if (data && typeof data === 'object') {
            if ('data' in data && Array.isArray(data.data)) {
                return data.data;
            }
            if ('value' in data && Array.isArray(data.value)) {
                return data.value;
            }
            if ('items' in data && Array.isArray(data.items)) {
                return data.items;
            }
            if ('events' in data && Array.isArray(data.events)) {
                return data.events;
            }
        }
        return data || [];
    },

    async getPastEventsForHall(hallId: number) {
        const response = await axiosInstance.get(`/api/app/halls/${hallId}/events/past`);
        let data = response.data;
        if (Array.isArray(data)) {
            console.log('Data is already an array');
            return data;
        }
        
        if (data && typeof data === 'object') {
            if ('data' in data && Array.isArray(data.data)) {
                return data.data;
            }
            if ('value' in data && Array.isArray(data.value)) {
                return data.value;
            }
            if ('items' in data && Array.isArray(data.items)) {
                return data.items;
            }
            if ('events' in data && Array.isArray(data.events)) {
                return data.events;
            }
        }
        return data || [];
    },
    
    async getEventTypesWithAlbums(): Promise<EventType[]> {
        const response = await axiosInstance.get('/api/app/event/event-types-with-albums');
        return response.data;
    }
    ,
    async createEventWithAlbums(
        ownerUserId: number,
        dto: {
            eventName: string,
            eventDate: string,
            backgroundImageUrl?: string,
            hallId: number,
            eventTypeId?: number
        },
        albumsNames: string[],
        eventImageFile?: File | null
    ) {
        const formData = new FormData();
        formData.append('dto', JSON.stringify(dto));
        albumsNames.forEach((name, idx) => {
            formData.append(`albumsNames[${idx}]`, name);
        });
        if (eventImageFile) {
            formData.append('eventImage', eventImageFile);
        }
        formData.append('ownerUserId', ownerUserId.toString());
        const response = await axiosInstance.post(
            '/api/app/event/create-event',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    async updateEventWithAlbums(
        eventId: number,
        dto: {
            eventName: string,
            eventDate: string,
            backgroundImageUrl?: string,
            hallId: number,
            eventTypeId?: number
        },
        albumsNames: string[],
        eventImageFile?: File | null
    ) {
        const formData = new FormData();
        formData.append('dto', JSON.stringify(dto));
        albumsNames.forEach((name, idx) => {
            formData.append(`albumsNames[${idx}]`, name);
        });
        if (eventImageFile) {
            formData.append('eventImage', eventImageFile);
        }
        formData.append('eventId', eventId.toString());
        const response = await axiosInstance.put(
            '/api/app/event/update-event',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    }
};
