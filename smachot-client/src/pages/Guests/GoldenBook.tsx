import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { goldenBookApi } from '../../services/GoldenBookApi';
import './../../styles/GoldenBook.css';

export const GoldenBook = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
        return <div>Missing event information.</div>;
    }
    const [senderName, setSenderName] = useState('');
    const [blessingContent, setBlessingContent] = useState('');
    const [addGift, setAddGift] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'bis' | 'bank' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        

        if (!eventId) {
            setError('Event ID is missing');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await goldenBookApi.addEntry({
                eventId: parseInt(eventId),
                senderName,
                content: blessingContent
            });

            // Success - reset form or navigate
            alert('הברכה נשלחה בהצלחה!');
            setSenderName('');
            setBlessingContent('');
            setAddGift(false);
            // Optionally navigate back or to another page
            // navigate('/guest-options');
        } catch (err: any) {
            setError(err.response?.data?.message || 'שגיאה בשליחת הברכה');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="golden-book-container">
            <div className="golden-book-form">
                <h1 className="golden-book-title">כתיבת ברכה</h1>
                
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="senderName">שם השולח</label>
                        <input
                            type="text"
                            id="senderName"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="form-input"
                            placeholder="שם שולח הברכה"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="blessing">תוכן הברכה</label>
                        <textarea
                            id="blessing"
                            value={blessingContent}
                            onChange={(e) => setBlessingContent(e.target.value)}
                            className="form-textarea"
                            placeholder="פה יכתב תוכן הברכה של האורח לבעל השמחה"
                            rows={5}
                            required
                        />
                    </div>

                    <div className="form-checkbox">
                        <label htmlFor="addGift">
                            <span>הוספת מתנה</span>
                            <input
                                type="checkbox"
                                id="addGift"
                                checked={addGift}
                                onChange={(e) => setAddGift(e.target.checked)}
                            />
                        </label>
                    </div>

                    {addGift && (
                        <div className="payment-methods">
                            <button
                                type="button"
                                className={`payment-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('bank')}
                            >
                                העברה בנקאית
                            </button>
                            <button
                                type="button"
                                className={`payment-btn ${paymentMethod === 'bis' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('bis')}
                            >
                                ביט
                            </button>
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'שולח...' : 'שלח'}
                    </button>
                </form>
            </div>
        </div>
    );
};
