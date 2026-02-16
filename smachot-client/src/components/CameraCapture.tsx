import React, { useRef, useEffect, useState } from 'react';
import '../styles/CameraCapture.css';
import { useTranslation } from '../hooks/useTranslation';

interface CameraCaptureProps {
    onCapture: (images: Blob[]) => void;
    onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImages, setCapturedImages] = useState<Blob[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const { t } = useTranslation();
    useEffect(() => {

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const capturePhoto = () => {
        if (capturedImages.length >= 5) return;
        
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newImages = [...capturedImages, blob];
                        const newUrl = URL.createObjectURL(blob);
                        setCapturedImages(newImages);
                        setPreviewUrls(prev => [...prev, newUrl]);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    const handleDone = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onCapture(capturedImages);
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        onClose();
    };

    const removeImage = (index: number) => {
        const newImages = capturedImages.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);
        URL.revokeObjectURL(previewUrls[index]);
        setCapturedImages(newImages);
        setPreviewUrls(newUrls);
    };

    return (
        <div className="camera-overlay">
            <div className="camera-header">
                <button onClick={handleClose} className="close-btn">✕</button>
                {/* <span className="camera-title"> צילום תמונות</span> */}
                 <span className="camera-title">{t('Taking pictures', 'Taking pictures')}</span>
                <div></div>
            </div>
            
            <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {previewUrls.length > 0 && (
                    <div className="preview-strip">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="preview-item">
                                <img src={url} alt={`Preview ${index + 1}`} />
                                <button 
                                    onClick={() => removeImage(index)}
                                    className="remove-btn"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="camera-controls">
                    <div className="counter">{capturedImages.length}/5</div>
                    <button 
                        onClick={capturePhoto} 
                        className="capture-btn"
                        disabled={capturedImages.length >= 5}
                    >
                        📷
                    </button>
                    {capturedImages.length > 0 && (
                        <button onClick={handleDone} className="done-btn">✓</button>
                    )}
                </div>
            </div>
        </div>
    );
};