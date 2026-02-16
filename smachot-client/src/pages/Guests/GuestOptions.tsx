import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './../../styles/GuestOptions.css';
import { useTranslation } from '../../hooks/useTranslation';

export const GuestOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get('eventId');
    const hallId = searchParams.get('hallId');
    const [showImagePopup, setShowImagePopup] = useState(false);
   const { t } = useTranslation();
    
    if (!eventId || !hallId) {
        return <div>Missing event or hall information.</div>;
    }

    return (
        <div className="guest-options-container">
            <h1>{t('Translate', 'Translate')}</h1>

            <div className="guest-options-grid">
                <button
                    className="guest-option-btn"
                    onClick={() => setShowImagePopup(true)}
                >
                    <span>העלאת תמונה</span>
                </button>

                <button
                    className="guest-option-btn"
                    onClick={() => navigate(`/video?eventId=${eventId}&hallId=${hallId}`)}
                >
                    <span>העלאת סרטון</span>
                </button>

                <button className="guest-option-btn" onClick={() => {}}>
                    <span>העברת כסף- מתנה</span>
                </button>

                <button
                    className="guest-option-btn"
                    onClick={() => navigate(`/golden-book?eventId=${eventId}`)}
                >
                    <span>כתיבת ברכה</span>
                </button>

                <button
                    className="guest-option-btn"
                    onClick={() => navigate(`/hall-feedback?eventId=${eventId}&hallId=${hallId}`)}
                >
                    <span>משוב לאולם</span>
                </button>
            </div>

            {showImagePopup && (
                <div className="popup-overlay" onClick={() => setShowImagePopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h3>בחר אופן העלאה</h3>
                        <button 
                            className="popup-option-btn"
                            onClick={() => {
                                navigate(`/image?eventId=${eventId}&hallId=${hallId}&mode=gallery`);
                                setShowImagePopup(false);
                            }}
                        >
                            📁 בחר מהגלריה
                        </button>
                        <button 
                            className="popup-option-btn"
                            onClick={() => {
                                navigate(`/image?eventId=${eventId}&hallId=${hallId}&mode=camera`);
                                setShowImagePopup(false);
                            }}
                        >
                            📷 צלם תמונה
                        </button>
                        <button 
                            className="popup-cancel-btn"
                            onClick={() => setShowImagePopup(false)}
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
