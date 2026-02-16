import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './../../styles/HallFeedback.css';
import { HallFeedbackApi } from '../../services/HallFeedbackApi';
import type { FeedbackCategory } from '../../services/HallFeedbackApi';

export const HallFeedback = () => {
    const [categories, setCategories] = useState<FeedbackCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [tableNumber, setTableNumber] = useState('');
    const [feedbackContent, setFeedbackContent] = useState('');
    const [rating, setRating] = useState(5);
    const [isDraggingRating, setIsDraggingRating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const ratingRef = useRef<HTMLDivElement | null>(null);
    const maxRating = 5;
    const ratingPercent = maxRating === 1 ? 0 : ((maxRating - rating) / (maxRating - 1)) * 100;

    // Get hallId and eventId from navigation
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const hallId = Number(searchParams.get('hallId'));
    const eventId = Number(searchParams.get('eventId'));
    if (!eventId || !hallId) {
        return <div>Missing event or hall information.</div>;
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await HallFeedbackApi.getFeedbackCategories();
                setCategories(data);
                if (data.length > 0) {
                    setSelectedCategory(data[0].Id);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setSubmitMessage({ type: 'error', text: 'שגיאה בטעינת קטגוריות' });
            }
        };

        fetchCategories();
    }, []);

    const updateRatingFromClientX = (clientX: number) => {
        if (!ratingRef.current) {
            return;
        }

        const rect = ratingRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const percentage = rect.width === 0 ? 0 : x / rect.width;
        const value = Math.max(1, Math.min(maxRating, maxRating - Math.round(percentage * maxRating) + 1));
        setRating(value);
    };

    const handleRatingPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDraggingRating(true);
        updateRatingFromClientX(e.clientX);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleRatingPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRating) {
            return;
        }

        updateRatingFromClientX(e.clientX);
    };

    const handleRatingPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDraggingRating(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handleRatingKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            setRating((current) => Math.min(maxRating, current + 1));
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            setRating((current) => Math.max(1, current - 1));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            await HallFeedbackApi.addFeedback({
                HallId: hallId,
                EventId: eventId,
                Category: selectedCategory,
                TableNumber: tableNumber ? parseInt(tableNumber) : undefined,
                Content: feedbackContent,
                Rating: rating
            });

            setSubmitMessage({ type: 'success', text: 'המשוב נשלח בהצלחה!' });
            // Reset form
            setFeedbackContent('');
            setTableNumber('');
            setRating(5);
            if (categories.length > 0) {
                setSelectedCategory(categories[0].Id);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'שגיאה בשליחת המשוב';
            setSubmitMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="hall-feedback-container">
            <div className="hall-feedback-form">
                <h1 className="hall-feedback-title">משוב</h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">נושא</label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(Number(e.target.value))}
                            className="form-input"
                            required
                            disabled={categories.length === 0}
                        >
                            {categories.map((category) => (
                                <option key={category.Id} value={category.Id}>
                                    {category.Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tableNumber">מס' שולחן - אופציונלי</label>
                        <input
                            type="number"
                            id="tableNumber"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="form-input"
                            placeholder="5"
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="feedback">תוכן המשוב</label>
                        <textarea
                            id="feedback"
                            value={feedbackContent}
                            onChange={(e) => setFeedbackContent(e.target.value)}
                            className="form-textarea"
                            placeholder="כאן יבוא תוכן המשוב של האורח לבעל האולם"
                            rows={5}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>דירוג</label>
                        <div
                            ref={ratingRef}
                            className="rating-slider"
                            role="slider"
                            aria-label="דירוג"
                            aria-valuemin={1}
                            aria-valuemax={maxRating}
                            aria-valuenow={rating}
                            tabIndex={0}
                            onPointerDown={handleRatingPointerDown}
                            onPointerMove={handleRatingPointerMove}
                            onPointerUp={handleRatingPointerUp}
                            onPointerCancel={handleRatingPointerUp}
                            onKeyDown={handleRatingKeyDown}
                            style={{ ['--rating-percent' as any]: `${ratingPercent}%` }}
                        >
                            <div className="rating-star-thumb">★</div>
                            <div className="rating-track" />
                            <div className="rating-knob">{rating}</div>
                        </div>
                    </div>

                    {submitMessage && (
                        <div className={`submit-message ${submitMessage.type}`}>
                            {submitMessage.text}
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
