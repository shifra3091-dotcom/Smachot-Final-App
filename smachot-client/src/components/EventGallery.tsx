import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/EventGallery.css';
import { getMediaGroupedByAlbum } from '../services/AlbumsApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7168';

interface Media {
    MediaId: number;
    FileUrl: string;
    MediaType: string | number;
    SenderName?: string;
    UploadedAt?: string;
}

interface AlbumGroup {
    AlbumId: number;
    AlbumName: string;
    MediaItems: Media[];
}

const VideoThumbnail: React.FC<{
    src: string;
    className?: string;
    controls?: boolean;
    onClick?: React.MouseEventHandler<HTMLVideoElement>;
}> = ({ src, className, controls, onClick }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            const targetTime = Math.min(0.1, Math.max(0, (video.duration || 1) / 100));
            if (!Number.isNaN(targetTime)) {
                video.currentTime = targetTime;
            }
        };

        const handleSeeked = () => {
            video.pause();
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('seeked', handleSeeked);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('seeked', handleSeeked);
        };
    }, [src]);

    return (
        <video
            ref={videoRef}
            src={src}
            className={className}
            preload="metadata"
            muted
            playsInline
            controls={controls}
            onClick={onClick}
        />
    );
};

export const EventGallery: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [albums, setAlbums] = useState<AlbumGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxMediaIndex, setLightboxMediaIndex] = useState(0);

    useEffect(() => {
        const fetchEventMedia = async () => {
            if (!eventId) return;
            console.log('Fetching media for event:', eventId);
            try {
                setLoading(true);
                setError('');
                
                const data = await getMediaGroupedByAlbum(Number(eventId));
                console.log('Received data:', data);
                console.log('Data type:', typeof data);
                console.log('Is array?', Array.isArray(data));
                console.log('Data length:', data?.length);
                
                if (Array.isArray(data) && data.length > 0) {
                    console.log('First item:', data[0]);
                    setAlbums(data);
                    setSelectedAlbumId(data[0].AlbumId);
                } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                    // אם זה אובייקט, נבדוק אם יש לו מאפיין שמכיל את המערך
                    console.log('Data keys:', Object.keys(data));
                    setAlbums(data);
                    if (data[0]) setSelectedAlbumId(data[0].AlbumId);
                } else {
                    console.log('Setting empty array');
                    setAlbums([]);
                }
            } catch (err: any) {
                console.error('Error fetching media:', err);
                console.error('Error details:', err.response?.data);
                
                // בדיקה אם זה object cycle error מהשרת
                if (err.response?.data?.includes?.('cycle')) {
                    setError('שגיאה בשרת - צריך לתקן את הנתונים המוחזרים');
                } else {
                    setError(`שגיאה בטעינת התמונות: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEventMedia();
    }, [eventId]);

    const handleMediaClick = (index: number) => {
        setLightboxMediaIndex(index);
        setLightboxOpen(true);
    };

    const handleNextMedia = () => {
        const currentAlbum = albums.find(a => a.AlbumId === selectedAlbumId);
        if (currentAlbum && lightboxMediaIndex < currentAlbum.MediaItems.length - 1) {
            setLightboxMediaIndex(lightboxMediaIndex + 1);
        }
    };

    const handlePrevMedia = () => {
        if (lightboxMediaIndex > 0) {
            setLightboxMediaIndex(lightboxMediaIndex - 1);
        }
    };

    if (loading) {
        return <div className="gallery-loading">טוען תמונות...</div>;
    }

    if (error) {
        return <div className="gallery-error">{error}</div>;
    }

    if (!albums || albums.length === 0) {
        return <div className="gallery-empty">אין תמונות זמינות לאירוع זה</div>;
    }

    return (
        <div className="event-gallery">
            <div className="gallery-header">
                <h1>צילומי כל התמונות</h1>
                <p className="gallery-subtitle">
                    כל הצילומים והתמונות מהאירוע מחולקים לפי אלבומים
                </p>
            </div>
            
            <div className="album-tabs">
                {albums.map(album => (
                    <button
                        key={album.AlbumId}
                        className={`album-tab ${selectedAlbumId === album.AlbumId ? 'active' : ''}`}
                        onClick={() => setSelectedAlbumId(album.AlbumId)}
                    >
                        {album.AlbumName}
                    </button>
                ))}
            </div>
            
            {selectedAlbumId && albums.find(a => a.AlbumId === selectedAlbumId) && (
                <div className="album-content">
                    <div className="media-grid">
                        {albums
                            .find(a => a.AlbumId === selectedAlbumId)
                            ?.MediaItems.map(item => {
                                console.log('Item keys:', Object.keys(item));
                                console.log('Full item:', item);
                                
                                const fullUrl = item.FileUrl?.startsWith?.('http') 
                                    ? item.FileUrl 
                                    : `${API_BASE_URL}/${item.FileUrl}`;
                                
                                console.log('Media item:', {
                                    MediaId: item.MediaId,
                                    MediaType: item.MediaType,
                                    FileUrl: item.FileUrl,
                                    fullUrl: fullUrl
                                });
                                
                                const openLightbox = () => {
                                    const currentAlbum = albums.find(a => a.AlbumId === selectedAlbumId);
                                    if (currentAlbum) {
                                        const index = currentAlbum.MediaItems.findIndex(m => m.MediaId === item.MediaId);
                                        handleMediaClick(index);
                                    }
                                };

                                const isImage = item.MediaType === 1 || item.MediaType === 'Image';

                                return (
                                    <div 
                                        key={item.MediaId} 
                                        className="media-item"
                                        onClick={isImage ? openLightbox : undefined}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {isImage ? (
                                            <img 
                                                src={fullUrl} 
                                                alt="תמונה מהאירוע"
                                                className="media-image"
                                                onError={(e) => console.error('Image failed to load:', fullUrl)}
                                            />
                                        ) : (
                                            <div className="media-video-wrapper">
                                                <VideoThumbnail
                                                    src={fullUrl}
                                                    className="media-video"
                                                    controls
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <button
                                                    type="button"
                                                    className="video-play-overlay"
                                                    aria-label="הצג בגדול"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openLightbox();
                                                    }}
                                                >
                                                    ▶
                                                </button>
                                                <span className="video-badge">וידאו</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {lightboxOpen && selectedAlbumId && (
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                    <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
                        
                        {albums.find(a => a.AlbumId === selectedAlbumId)?.MediaItems[lightboxMediaIndex] && (
                            <>
                                {albums.find(a => a.AlbumId === selectedAlbumId)!.MediaItems[lightboxMediaIndex].MediaType === 1 ||
                                albums.find(a => a.AlbumId === selectedAlbumId)!.MediaItems[lightboxMediaIndex].MediaType === 'Image' ? (
                                    <img 
                                        src={`${API_BASE_URL}/${albums.find(a => a.AlbumId === selectedAlbumId)!.MediaItems[lightboxMediaIndex].FileUrl}`}
                                        alt="תמונה"
                                        className="lightbox-media"
                                    />
                                ) : (
                                    <video 
                                        src={`${API_BASE_URL}/${albums.find(a => a.AlbumId === selectedAlbumId)!.MediaItems[lightboxMediaIndex].FileUrl}`}
                                        className="lightbox-media"
                                        controls
                                        autoPlay
                                    />
                                )}
                                
                                <button 
                                    className="lightbox-prev"
                                    onClick={handlePrevMedia}
                                    disabled={lightboxMediaIndex === 0}
                                >
                                    ‹
                                </button>
                                <button 
                                    className="lightbox-next"
                                    onClick={handleNextMedia}
                                    disabled={lightboxMediaIndex === albums.find(a => a.AlbumId === selectedAlbumId)!.MediaItems.length - 1}
                                >
                                    ›
                                </button>
                                
                                <div className="lightbox-counter">
                                    {lightboxMediaIndex + 1} / {albums.find(a => a.AlbumId === selectedAlbumId)!.MediaItems.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};