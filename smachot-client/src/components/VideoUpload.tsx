import React, { useRef, useState, useEffect } from 'react';
import '../styles/VideoUpload.css';
import { MediaApi } from '../services/MediaApi';

// const FAKE_EVENT_ID = 1; // Removed, will use eventId from navigation
const MAX_VIDEO_DURATION = 20; // seconds

interface Album {
    AlbumId: number;
    Name: string;
}

interface VideoUploadProps {
    eventId: number;
    hallId: number;
    albums: Album[];
    eventName?: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ eventId, albums, hallId, eventName }) => {
        const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
        const [tempSenderName, setTempSenderName] = useState('');
        const [tempIsPublic, setTempIsPublic] = useState(false);
        const [showAlbumSelection, setShowAlbumSelection] = useState(false);
        const [showInitialOptions, setShowInitialOptions] = useState(true);
        const [showSuccessPopup, setShowSuccessPopup] = useState(false);
        const [isFullscreenRecording, setIsFullscreenRecording] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [isRecording, setIsRecording] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stopBtnRef = useRef<HTMLButtonElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const recordingStartRef = useRef<number | null>(null);
    const recordingRafRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            closeCamera();
            if (recordingRafRef.current) {
                cancelAnimationFrame(recordingRafRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isRecording) {
            if (recordingRafRef.current) {
                cancelAnimationFrame(recordingRafRef.current);
                recordingRafRef.current = null;
            }
            recordingStartRef.current = null;
            return;
        }

        if (!recordingStartRef.current) {
            recordingStartRef.current = performance.now();
        }

        const updateWithRaf = (now: number) => {
            if (!recordingStartRef.current) return;
            const elapsedSeconds = (now - recordingStartRef.current) / 1000;
            if (elapsedSeconds >= MAX_VIDEO_DURATION) {
                stopBtnRef.current?.click();
                stopRecording();
                return;
            }
            recordingRafRef.current = requestAnimationFrame(updateWithRaf);
        };
        recordingRafRef.current = requestAnimationFrame(updateWithRaf);

        return () => {
            if (recordingRafRef.current) {
                cancelAnimationFrame(recordingRafRef.current);
                recordingRafRef.current = null;
            }
        };
    }, [isRecording]);

    useEffect(() => {
        if (isFullscreenRecording) {
            const root = document.getElementById('root') || document.documentElement;
            document.documentElement.style.width = '100vw';
            document.documentElement.style.height = '100vh';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';
            
            document.body.style.width = '100vw';
            document.body.style.height = '100vh';
            document.body.style.overflow = 'hidden';
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            
            if (root) {
                (root as HTMLElement).style.width = '100vw';
                (root as HTMLElement).style.height = '100vh';
                (root as HTMLElement).style.overflow = 'hidden';
                (root as HTMLElement).style.margin = '0';
                (root as HTMLElement).style.padding = '0';
            }
        } else {
            document.documentElement.style.width = '';
            document.documentElement.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
            
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
            
            const root = document.getElementById('root');
            if (root) {
                (root as HTMLElement).style.width = '';
                (root as HTMLElement).style.height = '';
                (root as HTMLElement).style.overflow = '';
                (root as HTMLElement).style.margin = '';
                (root as HTMLElement).style.padding = '';
            }
        }

        return () => {
            document.documentElement.style.width = '';
            document.documentElement.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
            
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
            
            const root = document.getElementById('root');
            if (root) {
                (root as HTMLElement).style.width = '';
                (root as HTMLElement).style.height = '';
                (root as HTMLElement).style.overflow = '';
                (root as HTMLElement).style.margin = '';
                (root as HTMLElement).style.padding = '';
            }
        };
    }, [isFullscreenRecording]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            // Check video duration
            const duration = await getVideoDuration(file);
            if (duration > MAX_VIDEO_DURATION) {
                setUploadStatus(`❌ Video is too long. Maximum duration is ${MAX_VIDEO_DURATION} seconds.`);
                return;
            }
            
            setSelectedVideo(file);
            setPreviewUrl(URL.createObjectURL(file));
            setVideoDuration(duration);
            setUploadStatus('');
        }
    };

    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const openCamera = async (fullscreen: boolean = false) => {
        try {
            setIsCameraOpen(true);
            if (fullscreen) {
                setIsFullscreenRecording(true);
            }
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: facingMode },
                audio: true 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                // Play video with error handling
                try {
                    await videoRef.current.play();
                } catch (playError) {
                    console.error('Error playing video:', playError);
                }
            }
        } catch (error) {
            console.error('Error accessing camera/microphone:', error);
            setUploadStatus('❌ Failed to access camera/microphone. Please check permissions.');
            setIsCameraOpen(false);
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        try {
            recordingStartRef.current = performance.now();
            const mediaRecorder = new MediaRecorder(streamRef.current, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });
            
            recordedChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const file = new File([blob], `recorded-${Date.now()}.webm`, { type: 'video/webm' });
                setSelectedVideo(file);
                setPreviewUrl(URL.createObjectURL(file));
                // Get actual duration from the recorded video file
                const duration = await getVideoDuration(file);
                setVideoDuration(duration);
                closeCamera();
                setIsRecording(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);

        } catch (error) {
            console.error('Error starting recording:', error);
            setUploadStatus('❌ Failed to start recording.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }

        if (recordingRafRef.current) {
            cancelAnimationFrame(recordingRafRef.current);
            recordingRafRef.current = null;
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
        setIsRecording(false);
        setIsFullscreenRecording(false);
    };

    const cancelRecording = () => {
        if (isRecording) {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        }
        closeCamera();
        recordedChunksRef.current = [];
        recordingStartRef.current = null;
        if (recordingRafRef.current) {
            cancelAnimationFrame(recordingRafRef.current);
            recordingRafRef.current = null;
        }
    };

    const switchCamera = async () => {
        if (isRecording) {
            // Can't switch during recording
            return;
        }
        
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        
        if (streamRef.current) {
            // Stop current stream
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            
            // Start new stream with different camera
            setTimeout(async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: newFacingMode },
                        audio: true 
                    });
                    
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        await videoRef.current.play();
                        streamRef.current = stream;
                    }
                } catch (error) {
                    console.error('Error switching camera:', error);
                    setUploadStatus('❌ Failed to switch camera.');
                }
            }, 100);
        }
    };

    const uploadVideo = async () => {
        if (!selectedVideo) {
            setUploadStatus('Please select or record a video first');
            return;
        }
        
        // בחירת אלבום "כללי" כברירת מחדל
        if (!selectedAlbumId && albums?.length > 0) {
            const generalAlbum = albums.find(album => album.Name === 'כללי');
            if (generalAlbum) {
                setSelectedAlbumId(generalAlbum.AlbumId);
            }
        }
        
        setShowAlbumSelection(true);
    };

    const confirmAlbumSelection = async () => {
        if (!selectedAlbumId) {
            setUploadStatus('Please select an album');
            return;
        }

        setIsUploading(true);
        setUploadStatus('Uploading...');

        try {
            const data = await MediaApi.uploadVideo({
                eventId: eventId,
                file: selectedVideo!,
                isPublic: tempIsPublic,
                durationSeconds: videoDuration || undefined,
                albumIds: [selectedAlbumId],
                senderName: tempSenderName
            });

            setUploadStatus(`✅ Video uploaded successfully`);
            // Reset after successful upload
            setShowAlbumSelection(false);
            setShowSuccessPopup(true);
            setTimeout(() => {
                setSelectedVideo(null);
                setPreviewUrl(null);
                setVideoDuration(null);
                setUploadStatus('');
                setSelectedAlbumId(null);
                setTempSenderName('');
                setTempIsPublic(true);
            }, 3000);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus(`❌ Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedVideo(null);
        setPreviewUrl(null);
        setVideoDuration(null);
        setUploadStatus('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const greenAnimationStyle = isRecording
        ? { animationDuration: '15s', animationDelay: '0s' }
        : undefined;
    const orangeAnimationStyle = isRecording
        ? { animationDuration: '3s', animationDelay: '15s' }
        : undefined;
    const redAnimationStyle = isRecording
        ? { animationDuration: '2s', animationDelay: '18s' }
        : undefined;

    return (
        <>
            {isCameraOpen && isFullscreenRecording && (
                <div style={{
                    position: 'fixed',
                    top: '0px',
                    left: '0px',
                    right: '0px',
                    bottom: '0px',
                    width: '100vw',
                    height: '100vh',
                    minWidth: '100vw',
                    minHeight: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    background: '#000',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    padding: '0px',
                    margin: '0px',
                    overflow: 'hidden',
                    border: 'none'
                }}>
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted
                        playsInline
                        className={`recording-video ${facingMode === 'user' ? 'mirrored' : ''}`}
                        style={{ 
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            width: '100vw', 
                            height: '100vh', 
                            minWidth: '100vw',
                            minHeight: '100vh',
                            objectFit: 'cover',
                            display: 'block',
                            margin: 0,
                            padding: 0
                        }}
                    />
                    {!isRecording && (
                        <button 
                            className="switch-camera-btn"
                            onClick={switchCamera}
                            title="Switch camera"
                            style={{ zIndex: 10 }}
                        >
                            🔄
                        </button>
                    )}
                    
                    {isRecording && (
                        <div className="recording-info" style={{
                            position: 'fixed',
                            top: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10
                        }}>
                            <span className="recording-indicator">🔴 REC</span>
                            <div className="recording-progress">
                                <div className="recording-progress-track">
                                    <div
                                        className={`recording-progress-segment recording-progress-green${isRecording ? ' recording-progress-animate' : ''}`}
                                        style={greenAnimationStyle}
                                    />
                                    <div
                                        className={`recording-progress-segment recording-progress-orange${isRecording ? ' recording-progress-animate' : ''}`}
                                        style={orangeAnimationStyle}
                                    />
                                    <div
                                        className={`recording-progress-segment recording-progress-red${isRecording ? ' recording-progress-animate' : ''}`}
                                        style={redAnimationStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="recording-controls" style={{
                        position: 'fixed',
                        bottom: 30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        display: 'flex',
                        gap: 10
                    }}>
                        {!isRecording ? (
                            <>
                                <button 
                                    className="start-record-btn"
                                    onClick={startRecording}
                                >
                                    ⏺️ Start Recording
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={cancelRecording}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    ref={stopBtnRef}
                                    id='stop-btn'
                                    className="stop-btn"
                                    onClick={stopRecording}
                                >
                                    ⏹️ Stop
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={cancelRecording}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="video-upload-container">
            {/* Initial Options Popup */}
            {showInitialOptions && !previewUrl && !isCameraOpen && (
                <div className="popup-overlay">
                    <div className="popup-content initial-options-popup">
                        <h3>Upload or Record Video</h3>
                        
                        <button 
                            className="option-btn choose-from-gallery-btn"
                            onClick={() => {
                                setShowInitialOptions(false);
                                fileInputRef.current?.click();
                            }}
                        >
                            📁 Choose from Gallery
                        </button>
                        
                        <button 
                            className="option-btn record-video-btn"
                            onClick={() => {
                                setShowInitialOptions(false);
                                openCamera(true);
                            }}
                        >
                            📹 Record Video
                        </button>
                        
                        <button 
                            className="option-btn cancel-initial-btn"
                            onClick={() => setShowInitialOptions(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <h2>Upload Video</h2>
            <p className="duration-info">Maximum duration: {MAX_VIDEO_DURATION} seconds</p>
            
            {!isCameraOpen && !previewUrl && (
                <div className="upload-options">
                    <button 
                        className="option-btn"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        📁 Choose from Gallery
                    </button>
                    
                    <button 
                        className="option-btn record-btn"
                        onClick={openCamera}
                    >
                        🎥 Record Video
                    </button>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {isCameraOpen && isFullscreenRecording && (
                <></>
            )}

            {isCameraOpen && !isFullscreenRecording && (
                <div className="recording-container">
                    <div className="video-wrapper">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted
                            playsInline
                            className={`recording-video ${facingMode === 'user' ? 'mirrored' : ''}`}
                        />
                        {!isRecording && (
                            <button 
                                className="switch-camera-btn"
                                onClick={switchCamera}
                                title="Switch camera"
                            >
                                🔄
                            </button>
                        )}
                    </div>
                    
                    {isRecording && (
                        <div className="recording-info">
                            <span className="recording-indicator">🔴 REC</span>
                            <div className="recording-progress">
                                <div className="recording-progress-track">
                                    <div
                                        className={`recording-progress-segment recording-progress-green${isRecording ? ' recording-progress-animate' : ''}`}
                                        style={greenAnimationStyle}
                                    />
                                    <div
                                        className={`recording-progress-segment recording-progress-orange${isRecording ? ' recording-progress-animate' : ''}`}
                                        style={orangeAnimationStyle}
                                    />
                                    <div
                                        className={`recording-progress-segment recording-progress-red${isRecording ? ' recording-progress-animate' : ''}`}
                                        style={redAnimationStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="recording-controls">
                        {!isRecording ? (
                            <>
                                <button 
                                    className="start-record-btn"
                                    onClick={startRecording}
                                >
                                    ⏺️ Start Recording
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={cancelRecording}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    ref={stopBtnRef}
                                    id='stop-btn'
                                    className="stop-btn"
                                    onClick={stopRecording}
                                >
                                    ⏹️ Stop
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={cancelRecording}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Album selection dropdown - Removed, using popup instead */}

            {/* Album Selection Popup */}
            {showAlbumSelection && (
                <div className="popup-overlay">
                    <div className="popup-content album-selection-popup">
                        <button onClick={() => setShowAlbumSelection(false)} className="popup-close-btn">✕</button>
                        <h3>Upload Video to Album</h3>
                        
                        <div className="form-section">
                            <label>Select Album:</label>
                            <div className="albums-selection-grid">
                                {albums.map(album => (
                                    <button 
                                        key={album.AlbumId}
                                        className={`album-selection-btn ${selectedAlbumId === album.AlbumId ? 'selected' : ''}`}
                                        onClick={() => setSelectedAlbumId(album.AlbumId)}
                                    >
                                        {album.Name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <label>Sender Name (Optional):</label>
                            <input 
                                type="text" 
                                placeholder="Enter sender name"
                                className="sender-input"
                                value={tempSenderName}
                                onChange={(e) => setTempSenderName(e.target.value)}
                            />
                        </div>
                        
                        <div className="form-section">
                            <div className="visibility-section">
                                <span className="visibility-label">Public Video</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={tempIsPublic}
                                        onChange={(e) => setTempIsPublic(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <p className="visibility-description">
                                {tempIsPublic ? 'Video will be visible to everyone' : 'Video will be visible to admin only'}
                            </p>
                        </div>
                        
                        <div className="popup-buttons">
                            <button 
                                onClick={confirmAlbumSelection}
                                className="confirm-btn"
                                disabled={!selectedAlbumId || isUploading}
                            >
                                Upload
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAlbumSelection(false);
                                    setSelectedAlbumId(null);
                                }} 
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewUrl && (
                <div className="preview-container">
                    <video 
                        ref={previewVideoRef}
                        src={previewUrl} 
                        controls
                        className="video-preview"
                    />
                    
                    {videoDuration && (
                        <div className="video-info">
                            Duration: {formatTime(Math.ceil(videoDuration))}
                        </div>
                    )}
                    
                    <div className="preview-actions">
                        <button 
                            className="upload-btn"
                            onClick={uploadVideo}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : '⬆️ Upload'}
                        </button>
                        <button 
                            className="clear-btn"
                            onClick={clearSelection}
                            disabled={isUploading}
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </div>
            )}
            
            {uploadStatus && (
                <div className={`upload-status ${uploadStatus.includes('✅') ? 'success' : uploadStatus.includes('❌') ? 'error' : ''}`}>
                    {uploadStatus}
                </div>
            )}

            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content success-popup">
                        <button
                            className="popup-close-btn"
                            onClick={() => {
                                window.location.href = `/guest-options?eventId=${eventId}${hallId ? `&hallId=${hallId}` : ''}`;
                            }}
                        >
                            ✕
                        </button>
                        <h3>תודה שהעלית סרטון<br/>ל{eventName || `אירוע ${eventId}`}</h3>
                        <p>הסרטון נשמר ונוסף לאלבום האירוע.</p>
                        <button 
                            className="success-btn"
                            onClick={() => window.location.href = `/event-gallery/${eventId}`}
                        >
                            לכלל התמונות מהאירוע
                        </button>
               
                    </div>
                </div>
            )}
            </div>
        </>
    );
};
