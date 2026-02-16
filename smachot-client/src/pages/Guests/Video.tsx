import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { VideoUpload } from '../../components/VideoUpload';
import { getAlbumsForEvent } from '../../services/AlbumsApi';
import { eventsApi } from '../../services/EventsApi';

interface Album {
  AlbumId: number;
  Name: string;
}

export const Video: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get('eventId');
    const hallId = searchParams.get('hallId');
    const eventNameFromQuery = searchParams.get('eventName');

    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string | undefined>();

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);
        setError(null);
        Promise.all([
            getAlbumsForEvent(Number(eventId)),
            eventsApi.getEvents(Number(eventId)).then(res => {
                // Try common name fields
                return (res?.eventName || res?.name || res?.EventName || res?.Name) as string | undefined;
            }).catch(() => undefined)
        ])
            .then(([albumsResponse, fetchedName]) => {
                setAlbums(albumsResponse);
                const finalName = eventNameFromQuery || fetchedName;
                if (finalName) setEventName(finalName);
            })
            .catch(() => setError('Failed to load albums'))
            .finally(() => setLoading(false));
    }, [eventId, eventNameFromQuery]);

    if (!eventId) {
        return <Navigate to="/guest-options" replace />;
    }

    return (
        <div>
            <h2>Choose Album to Upload Video</h2>
            {loading && <div>Loading albums...</div>}
            {error && <div style={{color: 'red'}}>{error}</div>}
            {!loading && !error && (
                <>
                    {albums.length === 0 && (
                        <div style={{color: 'gray'}}>There are no albums available.</div>
                    )}
                    <VideoUpload eventId={Number(eventId)} albums={albums} hallId={Number(hallId)} eventName={eventName} />
                </>
            )}
        </div>
    );
};
