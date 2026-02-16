import axiosInstance from './axiosInstance';

export interface MediaItem {
    mediaId: number;
    fileUrl: string;
    mediaType: number; // 1 = Image, 2 = Video
    albumId: number;
    albumName: string;
    senderName?: string;
    uploadDate: string;
}

export interface EventMediaResponse {
    albums: {
        albumId: number;
        albumName: string;
        media: MediaItem[];
    }[];
}

export interface UploadResponse {
    mediaId: number;
    fileUrl: string;
    message: string;
}
export interface UploadImageParams {
    eventId: number;
    file: File;
    isPublic: boolean;
    albumIds: number[];
    senderName?: string;
}

export interface UploadVideoParams {
    eventId: number;
    file: File;
    isPublic: boolean;
    durationSeconds?: number;
    albumIds: number[];
    senderName?: string;
}

export const MediaApi = {
    /**
     * Upload an image file to the server
     */
    uploadImage: async (params: UploadImageParams): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('EventId', params.eventId.toString());
        formData.append('MediaType', '1'); // Image = 1
        formData.append('File', params.file);
        // ASP.NET model binding expects true/false for bools
        formData.append('IsPublic', params.isPublic ? 'true' : 'false');
        
        // Send AlbumIds as array
        if (params.albumIds && params.albumIds.length > 0) {
            params.albumIds.forEach((id, index) => {
                formData.append(`AlbumIds[${index}]`, id.toString());
            });
        }

        // Always send GuestName (empty string if not provided)
        formData.append('GuestName', params.senderName || '');

        console.log('FormData contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axiosInstance.post('/api/app/Media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    /**
     * Upload a video file to the server
     */
 uploadVideo: async (params: UploadVideoParams): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('EventId', params.eventId.toString());
    formData.append('MediaType', '2'); // Video = 2
    formData.append('File', params.file);
    formData.append('IsPublic', params.isPublic ? 'true' : 'false');
    
    // Send AlbumIds as array with index notation (PascalCase)
    if (params.albumIds && params.albumIds.length > 0) {
        params.albumIds.forEach((id, index) => {
            formData.append(`AlbumIds[${index}]`, id.toString());
        });
    }
    
    if (params.durationSeconds) {
        formData.append('DurationSeconds', Math.ceil(params.durationSeconds).toString());
    }
    
    // GuestName בPascalCase (או שנה את ה־DTO אם התכנית היא camelCase)
    formData.append('GuestName', params.senderName || '');

    // Log FormData contents for debugging
    console.log('VideoUpload FormData contents:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    // Endpoint path is case-sensitive on some hosts; align with controller route
    const response = await axiosInstance.post('/api/app/Media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
},
    /**
     * Get public media for event
     */
    getPublicMediaForEvent: async (eventId: number): Promise<EventMediaResponse> => {
        console.log('Fetching media for event:', eventId);
        try {
            const response = await axiosInstance.get(`/api/app/Media/event/${eventId}?publicOnly=true`);
            console.log('Media response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching media:', error);
            throw error;
        }
    }
};
