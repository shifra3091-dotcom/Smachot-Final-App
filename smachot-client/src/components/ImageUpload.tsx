import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/ImageUpload.css';
import { MediaApi } from '../services/MediaApi';
import { eventsApi } from '../../src/services/EventsApi';
interface Album {
    AlbumId: number;
    Name: string;
}

interface ImageUploadProps {
    eventId: number;
    albums: Album[];
    eventName?: string;
    hallId:number;
}

interface ImageSlot {
    file: File | null;
    previewUrl: string | null;
    isPublic: boolean;
    albumIds?: number[];
    senderName?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ eventId, albums, eventName, hallId }) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    const [images, setImages] = useState<ImageSlot[]>(Array.from({ length: 5 }, () => ({ file: null, previewUrl: null, isPublic: true, albumIds: [], senderName: '' })));
    const [linkedImages, setLinkedImages] = useState<ImageSlot[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [draggedImages, setDraggedImages] = useState<number[]>([]);
    const [selectedImages, setSelectedImages] = useState<number[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [popupData, setPopupData] = useState<{albumId: number, albumName: string, imageIndices: number[]}>({albumId: 0, albumName: '', imageIndices: []});
    const [tempSenderName, setTempSenderName] = useState('');
    const [tempIsPublic, setTempIsPublic] = useState(false);
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showAlbumSelection, setShowAlbumSelection] = useState(false);
    const [eventName2, setEventName2] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    useEffect(() => {
        if (mode === 'camera') {
            openCamera();
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [mode]);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            streamRef.current = stream;
            setIsCameraOpen(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            console.error('Error opening camera:', error);
            setUploadStatus('❌ לא ניתן לפתוח את המצלמה');
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
        
            canvas.toBlob((blob) => {
                if (blob) {
                    const previewUrl = URL.createObjectURL(blob);
                    setPreviewImage(previewUrl);
                    setShowImagePreview(true);
                }
            }, 'image/jpeg');
        }
    };

    const acceptPhoto = () => {
        if (previewImage) {
            fetch(previewImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const newImages = [...images];
                    
                    const emptySlotIndex = newImages.findIndex(img => img.file === null);
                    if (emptySlotIndex !== -1) {
                        newImages[emptySlotIndex] = { file, previewUrl: previewImage, isPublic: true, albumIds: [], senderName: '' };
                        setImages(newImages);
                        
                        const filledCount = newImages.filter(img => img.file !== null).length;
                        if (filledCount === 5 && streamRef.current) {
                            streamRef.current.getTracks().forEach(track => track.stop());
                            setIsCameraOpen(false);
                        }
                    }
                });
        }
        setShowImagePreview(false);
        setPreviewImage(null);
    };

    const rejectPhoto = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        setShowImagePreview(false);
        setPreviewImage(null);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // If trying to select more files than available slots
        if (files.length > 5) {
            setUploadStatus('⚠️ ניתן לבחור עד 5 תמונות בלבד');
            setTimeout(() => setUploadStatus(''), 3000);
            // Reset input
            if (event.target) event.target.value = '';
            return;
        }

        const currentCount = images.filter(img => img.file !== null).length;
        const availableSlots = 5 - currentCount;
        const filesToAdd = Math.min(files.length, availableSlots);

        if (files.length > availableSlots) {
            setUploadStatus(`ניתן להוסיף עד ${availableSlots} תמונות נוספות בלבד`);
            setTimeout(() => setUploadStatus(''), 3000);
        }

        const newImages = [...images];
        let addedCount = 0;

        for (let i = 0; i < files.length && addedCount < filesToAdd; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const emptySlotIndex = newImages.findIndex(img => img.file === null);
                if (emptySlotIndex !== -1) {
                    newImages[emptySlotIndex] = { file, previewUrl: URL.createObjectURL(file), isPublic: true, albumIds: [], senderName: '' };
                    addedCount++;
                }
            }
        }

        setImages(newImages);
        if (event.target) event.target.value = '';
    };

    const removeImage = (slotIndex: number) => {
        const newImages = [...images];
        if (newImages[slotIndex].previewUrl) {
            URL.revokeObjectURL(newImages[slotIndex].previewUrl!);
        }
        newImages[slotIndex] = { file: null, previewUrl: null, isPublic: true, albumIds: [], senderName: '' };
        setImages(newImages);
        setSelectedImages(prev => prev.filter(i => i !== slotIndex));
        
        if (mode === 'camera' && !isCameraOpen) {
            openCamera();
        }
    };

    const toggleImageSelection = (imageIndex: number) => {
        const currentCount = selectedImages.length;
        
        // If already selected, allow deselection
        if (selectedImages.includes(imageIndex)) {
            setSelectedImages(prev => prev.filter(i => i !== imageIndex));
            return;
        }
        
        // If trying to select more than 5, show alert
        if (currentCount >= 5) {
            setUploadStatus('⚠️ ניתן לבחור עד 5 תמונות בלבד');
            setTimeout(() => setUploadStatus(''), 3000);
            return;
        }
        
        // Otherwise add to selection
        setSelectedImages(prev => [...prev, imageIndex]);
    };

    const handleDragStart = (e: React.DragEvent, imageIndex: number) => {
        const imagesToDrag = selectedImages.includes(imageIndex) ? selectedImages : [imageIndex];
        setDraggedImages(imagesToDrag);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTouchStart = (imageIndex: number) => {
        const imagesToDrag = selectedImages.includes(imageIndex) ? selectedImages : [imageIndex];
        setDraggedImages(imagesToDrag);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, albumId: number, albumName: string) => {
        e.preventDefault();
        if (draggedImages.length > 0) {
            setPopupData({ albumId, albumName, imageIndices: draggedImages });
            setTempSenderName('');
            setTempIsPublic(true);
            setShowPopup(true);
        }
        setDraggedImages([]);
    };

    const handleTouchEnd = ( albumId: number, albumName: string) => {
        if (draggedImages.length > 0) {
            setPopupData({ albumId, albumName, imageIndices: draggedImages });
            setTempSenderName('');
            setTempIsPublic(true);
            setShowPopup(true);
        }
        setDraggedImages([]);
    };

    const confirmLinkToAlbum = () => {
        const newImages = [...images];
        const newLinkedImages = [...linkedImages];
        
        popupData.imageIndices.forEach(index => {
            if (newImages[index].file) {
                // מוסיפים למערך התמונות המקושרות
                newLinkedImages.push({
                    ...newImages[index],
                    albumIds: [popupData.albumId],
                    senderName: tempSenderName,
                    isPublic: tempIsPublic
                });
                
                // מסירים מהמסך
                if (newImages[index].previewUrl) {
                    URL.revokeObjectURL(newImages[index].previewUrl!);
                }
                newImages[index] = { file: null, previewUrl: null, isPublic: true, albumIds: [], senderName: '' };
            }
        });
        
        setImages(newImages);
        setLinkedImages(newLinkedImages);
        setShowPopup(false);
        setDraggedImages([]);
        setSelectedImages([]);
        
        if (mode === 'camera' && !isCameraOpen) {
            openCamera();
        }
    };

    const uploadImages = async () => {
        const filledImages = images.filter(img => img.file !== null);
        if (filledImages.length === 0) {
            setUploadStatus('אין תמונות להעלאה');
            return;
        }
        // קריאה לפונקציה לקבלת שם האירוע
        await getEventName();
        // בחירת אלבום "כללי" כברירת מחדל
        const generalAlbum = albums?.find(album => album.Name === 'כללי');
        if (generalAlbum) {
            setSelectedAlbumId(generalAlbum.AlbumId);
        }
        setShowAlbumSelection(true);
    };

    const confirmAlbumSelection = async () => {
        if (!selectedAlbumId) {
            setUploadStatus('אנא בחר אלבום');
            return;
        }
        
        const filledImages = images.filter(img => img.file !== null);
        setIsUploading(true);
        setUploadStatus(`מעלה ${filledImages.length} תמונות...`);

        try {
            for (const img of filledImages) {
                await MediaApi.uploadImage({
                    eventId: eventId,
                    file: img.file!,
                    isPublic: tempIsPublic,
                    albumIds: [selectedAlbumId]
                });
            }

            setUploadStatus(`✅ ${filledImages.length} תמונות הועלו בהצלחה`);
            setShowSuccessPopup(true);
            setImages(Array.from({ length: 5 }, () => ({ file: null, previewUrl: null, isPublic: true, albumIds: [], senderName: '' })));
            setShowAlbumSelection(false);
            setSelectedAlbumId(null);
            setTimeout(() => {
                setUploadStatus('');
            }, 3000);
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'העלאה נכשלה';
            setUploadStatus(`❌ ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const getAlbumImageCount = (albumId: number) => {
        return linkedImages.filter(img => img.albumIds && img.albumIds.includes(albumId)).length;
    };
 const getEventName = async () => {
     
        // const fetchEventTypes = async () => {
            try {
                const data = await eventsApi.getEvents(eventId);
                setEventName2(data.EventName);
                console.log(data.EventName);
              
                
                
               
            } catch (error) {
                console.error('Error fetching event types:', error);
            }
        // };

        // fetchEventTypes();
    }



    const hasLinkedImages = linkedImages.length > 0;
    const filledImages = images.filter(img => img.file !== null);
    const totalImages = filledImages.length + linkedImages.length;
    const canAddMore = totalImages < 5;

    return (
        <div className={`image-upload-container ${mode === 'camera' ? 'camera-mode' : ''}`}>
            {mode === 'gallery' && <h2 className="gallery-title">גלריית תמונות</h2>}
            
            {albums?.length > 0 && showAlbumSelection && (
                <div className="popup-overlay">
                    <div className="popup-content album-selection-popup">
                        <button onClick={() => {
                            setShowAlbumSelection(false);
                            getEventName();
                        }} className="popup-close-btn">✕</button>
                        <h3>העלאת תמונות ל{eventName2 || 'האירוע'}</h3>
                        
                        <div className="form-section">
                            <label>קטגוריות תמונות:</label>
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
                            <label>שם השולח (אופציונלי):</label>
                            <input 
                                type="text" 
                                placeholder="הכנס שם"
                                className="sender-input"
                            />
                        </div>
                        
                        <div className="form-section">
                            <div className="visibility-section">
                                <span className="visibility-label">תמונות גלויות</span>
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
                                לידע התמונות לא יוצגו לאחרים
                            </p>
                        </div>
                        
                        <div className="popup-buttons">
                            <button 
                                onClick={confirmAlbumSelection}
                                className="confirm-btn"
                                disabled={!selectedAlbumId || isUploading}
                            >
                                אישור
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAlbumSelection(false);
                                    setSelectedAlbumId(null);
                                }} 
                                className="cancel-btn"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedImages.length > 0 && (
                <div className="selection-info">
                    נבחרו {selectedImages.length} תמונות
                    <button onClick={() => setSelectedImages([])}>בטל בחירה</button>
                </div>
            )}

            {mode === 'camera' && (
                <>
                    {canAddMore && isCameraOpen && (
                        <div className="fullscreen-camera">
                            <div className="camera-header">
                                <button 
                                    onClick={closeCamera}
                                    className="close-btn"
                                >
                                    ✕
                                </button>
                                <span className="camera-title">צילום תמונות</span>
                                <div></div>
                            </div>
                            
                            <video ref={videoRef} autoPlay playsInline muted className="fullscreen-video" />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            
                            {filledImages.length > 0 && (
                                <div className="preview-strip">
                                    {filledImages.map((img, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={img.previewUrl!} alt={`Preview ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="camera-controls">
                                <button onClick={capturePhoto} className="capture-btn">📷</button>
                                <button
                                    onClick={closeCamera}
                                    className="finish-capture-btn"
                                >
                                    סיום צילום
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {showImagePreview && (
                        <div className="image-preview-overlay">
                            <div className="preview-container">
                                <img src={previewImage!} alt="Preview" className="preview-image" />
                                <div className="preview-controls">
                                    <button onClick={rejectPhoto} className="reject-btn">✕</button>
                                    <button onClick={acceptPhoto} className="accept-btn">✓</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!isCameraOpen && (
                        <div className="camera-review-screen">
                            <div className="camera-review-header">
                                <div className="camera-review-brand">
                                    <span className="camera-review-logo">Toastpix</span>
                                    {canAddMore && (
                                        <button
                                            className="open-camera-btn"
                                            onClick={openCamera}
                                            aria-label="פתח מצלמה"
                                            title="פתח מצלמה"
                                        >
                                            <img
                                                className="open-camera-icon"
                                                alt=""
                                                aria-hidden="true"
                                                src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f5f5f5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 7h3l2-2h6l2 2h3v12H4z'/><circle cx='12' cy='13' r='3.5'/></svg>"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {filledImages.length > 0 && (
                                <div className="captured-images-gallery">
                                    <div className="camera-review-title">תמונות שצילמתי</div>
                                    <div className="camera-review-subtitle">גרור תמונה לקטגוריה הרצויה</div>
                                    <div className="captured-grid">
                                        {filledImages.map((img, index) => (
                                            <div key={index} className="captured-item">
                                                <img src={img.previewUrl!} alt={`תמונה ${index + 1}`} />
                                                <button 
                                                    onClick={() => removeImage(images.findIndex(i => i.file === img.file))}
                                                    className="remove-captured-btn"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        className="upload-all-btn camera-review-upload"
                                        onClick={uploadImages}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'מעלה...' : 'אישור העלאה'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {uploadStatus && (
                        <div className={`upload-status ${uploadStatus.includes('✅') ? 'success' : uploadStatus.includes('❌') ? 'error' : ''}`}>
                            {uploadStatus}
                        </div>
                    )}
                </>
            )}

            {mode === 'gallery' && (
                <>
                    <div className="images-grid">
                        {images.map((img, index) => 
                            img.previewUrl ? (
                                <div 
                                    key={index} 
                                    className={`image-slot ${
                                        img.albumIds && img.albumIds.length > 0 ? 'linked' : ''
                                    } ${
                                        selectedImages.includes(index) ? 'selected' : ''
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onTouchStart={() => handleTouchStart(index)}
                                    onClick={() => toggleImageSelection(index)}
                                >
                                    <img src={img.previewUrl} alt={`תמונה ${index + 1}`} className="slot-image" />
                                    <button 
                                        className="remove-image-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        disabled={isUploading}
                                    >
                                        ✕
                                    </button>
                                    {selectedImages.includes(index) && (
                                        <>
                                            <div className="selection-indicator">✓</div>
                                            <div className="selection-number">{selectedImages.indexOf(index) + 1}</div>
                                        </>
                                    )}
                                    {img.albumIds && img.albumIds.length > 0 && (
                                        <div className="album-indicator">
                                            {albums?.find(a => a.AlbumId === img.albumIds![0])?.Name}
                                        </div>
                                    )}
                                </div>
                            ) : null
                        )}
                        {canAddMore && (
                            <div className="image-slot">
                                <label className="add-image-label">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        disabled={isUploading}
                                    />
                                    <div className="add-image-icon">+</div>
                                    <div className="add-image-text">הוסף תמונות</div>
                                </label>
                            </div>
                        )}
                    </div>

                    {filledImages.length > 0 && (
                        <button 
                            className="upload-all-btn"
                            onClick={uploadImages}
                            disabled={isUploading}
                        >
                            {isUploading ? 'מעלה...' : `העלאת ${filledImages.length} תמונות`}
                        </button>
                    )}

                    {uploadStatus && (
                        <div className={`upload-status ${uploadStatus.includes('✅') ? 'success' : uploadStatus.includes('❌') ? 'error' : ''}`}>
                            {uploadStatus}
                        </div>
                    )}
                </>
            )}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>קישור {popupData.imageIndices.length} תמונות לאלבום: {popupData.albumName}</h3>
                        
                        <div className="popup-images-preview">
                            {popupData.imageIndices.map(index => (
                                <div key={index} className="popup-image-item">
                                    <img 
                                        src={images[index].previewUrl!} 
                                        alt={`תמונה ${index + 1}`} 
                                        className="popup-image"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div>
                            <label>שם השולח:</label>
                            <input 
                                type="text" 
                                value={tempSenderName} 
                                onChange={(e) => setTempSenderName(e.target.value)}
                                placeholder="הכנס שם שולח"
                            />
                        </div>
                        <div className="visibility-toggle-popup">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={tempIsPublic}
                                    onChange={(e) => setTempIsPublic(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span className="toggle-label">{tempIsPublic ? 'תמונות גלויות לכולם' : 'מנהל בלבד'}</span>
                        </div>
                        <div className="popup-buttons">
                            <button onClick={confirmLinkToAlbum}>אישור</button>
                            <button onClick={() => setShowPopup(false)}>ביטול</button>
                        </div>
                    </div>
                </div>
            )}
            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content success-popup">
                        <button
                            className="close-btn"
                            onClick={() => {
                                window.location.href = `/guest-options?eventId=${eventId}${hallId ? `&hallId=${hallId}` : ''}`;
                            }}
                        >
                            ✕
                        </button>
            

                        <h3>תודה שהעלית תמונות<br/>ל{eventName2 || 'האירוע'}</h3>
                        <p>התמונות שעלית נשמרו ונוספו<br/>לאלבום האירוע, והן יהיו לזיכרון<br/>מרגש עבור החתן והכלה.</p>
                        <button 
                            className="success-btn"
                            onClick={() => window.location.href = `/event-gallery/${eventId}`}
                        >
                            לכלל התמונות מהאירוע
                        </button>
                        <button
                            className="success-btn secondary-success-btn"
                            onClick={() => {
                                window.location.href = `/guest-options?eventId=${eventId}${hallId ? `&hallId=${hallId}` : ''}`;
                            }}
                        >
                            חזרה למסך הראשי
                        </button>
                  
                    </div>
                </div>
            )}
        </div>
    );
};