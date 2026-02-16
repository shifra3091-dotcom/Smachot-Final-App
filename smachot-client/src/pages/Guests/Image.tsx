
import React, { useEffect, useState } from 'react';
import { ImageUpload } from '../../components/ImageUpload';
import { useLocation, Navigate } from 'react-router-dom';
import { getAlbumsForEvent } from '../../services/AlbumsApi';

interface Album {
  AlbumId: number;
  Name: string;
}

export const Image: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get('eventId');
    const hallId = searchParams.get('hallId');
    const eventName = searchParams.get('eventName');
    


    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);
        setError(null);
        getAlbumsForEvent(Number(eventId))
            .then(setAlbums)
            .catch(() => setError('Failed to load albums'))
            .finally(() => setLoading(false));
    }, [eventId]);

    if (!eventId) {
        return <Navigate to="/guest-options" replace />;
    }

    return (
        <div>
            <h2>Choose Album to Upload Image</h2>
            {loading && <div>Loading albums...</div>}
            {error && <div style={{color: 'red'}}>{error}</div>}
            {!loading && !error && (
                <>
                    {albums.length === 0 && (
                        <div style={{color: 'gray'}}>There are no albums available.</div>
                    )}
                    <ImageUpload eventId={Number(eventId)} albums={albums} hallId={Number(hallId)} />
                </>
            )}
        </div>
    );
};
