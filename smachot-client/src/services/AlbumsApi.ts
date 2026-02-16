import axiosInstance from './axiosInstance';

export const getAlbumsForEvent = async (eventId: number) => {
  const response = await axiosInstance.get(`/api/app/album/event/${eventId}`);
  return response.data;
};

export const getMediaGroupedByAlbum = async (eventId: number, publicOnly: boolean = true, includeUnassigned: boolean = true) => {
  const response = await axiosInstance.get(`/api/app/media/event/${eventId}/albums`, {
    params: {
      publicOnly,
      includeUnassigned
    }
  });
  console.log('Full response:', response);
  console.log('Response data:', response.data);
  
  return response.data;
};
