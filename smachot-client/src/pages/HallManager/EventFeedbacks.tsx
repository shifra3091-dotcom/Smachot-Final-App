import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../services/EventsApi';
import { HallFeedbackApi } from '../../services/HallFeedbackApi';
import axiosInstance from '../../services/axiosInstance';

interface FeedbackDto {
	Id: number;
	EventId: number;
	HallId: number;
	Category: number;
	CategoryName?: string;
	TableNumber?: number;
	Content: string;
	GuestName?: string;
	Rating?: number;
	CreatedAt: string;
}

interface EventDto {
	EventId: number;
	EventName: string;
	EventStartDate: string;
	BackgroundImageUrl?: string;
	HallName: string;
}

interface CategoryDto {
	Id: number;
	Name: string;
}

const EventFeedbacks: React.FC = () => {
	const { eventId } = useParams<{ eventId: string }>();
	const navigate = useNavigate();
	const [feedbacks, setFeedbacks] = useState<FeedbackDto[]>([]);
	const [event, setEvent] = useState<EventDto | null>(null);
	const [loading, setLoading] = useState(false);
	const [showFilterPopup, setShowFilterPopup] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // שמות הקטגוריות שנבחרו
	const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]); // Temporary selection in popup
	const [eventCategories, setEventCategories] = useState<CategoryDto[]>([]);

	useEffect(() => {
		if (!eventId) return;

		const eventIdNum = parseInt(eventId, 10);
		setLoading(true);

		Promise.all([
			eventsApi.getEvents(eventIdNum),
			HallFeedbackApi.getFeedbacksForEvent(eventIdNum),
			HallFeedbackApi.getCategoriesForEvent(eventIdNum) // Fetch categories on initial load
		])
			.then(([eventData, feedbacksData, categoriesData]) => {
				setEvent(eventData);
				const normalizedFeedbacks = (feedbacksData || []).map((feedback: FeedbackDto & { rating?: number }) => ({
					...feedback,
					Rating: feedback.Rating ?? feedback.rating ?? 0,
				}));
				setFeedbacks(normalizedFeedbacks);
				setEventCategories(categoriesData || []);
			})
			.catch((error) => {
				console.error('Error fetching event or feedbacks:', error);
			})
			.finally(() => setLoading(false));
	}, [eventId]);

	// Initialize temp selection with current selection when popup opens
	useEffect(() => {
		if (showFilterPopup) {
			setTempSelectedCategories(selectedCategories);
		}
	}, [showFilterPopup, selectedCategories]);

	const getEventImageUrl = (imageUrl?: string): string | undefined => {
		if (!imageUrl) return undefined;
		if (imageUrl.startsWith('http')) return imageUrl;
		const baseUrl = axiosInstance.defaults.baseURL;
		return `${baseUrl}/${imageUrl}`;
	};

	// Helper to get category name by ID
	const getCategoryName = (categoryId: number): string => {
		const category = eventCategories.find(c => c.Id === categoryId);
		return category ? category.Name : `${categoryId}`;
	};

	const renderStars = (rating: number = 0) => {
		return (
			<div style={{ display: 'flex', gap: 2 }}>
				{[1, 2, 3, 4, 5].map((star) => (
					<span
						key={star}
						style={{
							fontSize: 16,
							color: star <= rating ? '#FFD700' : '#ddd',
						}}
					>
						★
					</span>
				))}
			</div>
		);
	};

	// Handle category selection by name
	const handleCategoryToggle = (categoryName: string) => {
		if (tempSelectedCategories.includes(categoryName)) {
			// Remove if already selected
			setTempSelectedCategories(tempSelectedCategories.filter(name => name !== categoryName));
		} else {
			// Add to selection
			setTempSelectedCategories([...tempSelectedCategories, categoryName]);
		}
	};

	// Apply filter and close popup
	const handleApplyFilter = () => {
		console.log("handleApplyFilter");
		console.log(tempSelectedCategories);
		setSelectedCategories(tempSelectedCategories);
		setShowFilterPopup(false);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setTempSelectedCategories([]);
	};

	// Filter feedbacks based on selected categories
	const filteredFeedbacks = selectedCategories.length === 0
		? feedbacks // Show all if no categories selected
		: feedbacks.filter(fb => {
			const categoryName = getCategoryName(fb.Category);
			const isIncluded = selectedCategories.includes(categoryName);
			console.log(`Feedback Category ID: ${fb.Category}, Category Name: ${categoryName}, Selected: ${isIncluded}`);
			return isIncluded;
		});

	return (
		<div style={{ direction: 'rtl', background: '#fff', minHeight: '100vh', padding: 0 }}>
			{/* Mobile status bar space */}
			<div style={{ height: 44, background: '#fff' }} />

			{/* Header with back button and filter */}
			<div
				style={{
					padding: '12px 16px',
					borderBottom: '1px solid #f0f0f0',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 12,
				}}
			>
				<button
					onClick={() => navigate(-1)}
					style={{
						background: 'none',
						border: 'none',
						fontSize: 24,
						cursor: 'pointer',
						padding: 4,
					}}
				>
					←
				</button>
				
				{/* Filter Icon */}
				<button
					onClick={() => setShowFilterPopup(true)}
					style={{
						background: 'none',
						border: 'none',
						fontSize: 24,
						cursor: 'pointer',
						padding: 4,
					}}
					title="סינון"
				>
					⚙️
				</button>
			</div>

		
			{loading ? (
				<div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>טוען...</div>
			) : !event ? (
				<div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>אירוע לא נמצא</div>
			) : (
				<div style={{ maxWidth: 600, margin: '0 auto' }}>
					{/* Event Header Card */}
					<div
						style={{
							padding: '16px',
							background: '#fff',
						}}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'row-reverse',
								gap: 12,
								alignItems: 'flex-start',
							}}
						>
							{/* Event Image */}
							{getEventImageUrl(event.BackgroundImageUrl) && (
								<div
									style={{
										width: 100,
										height: 100,
										minWidth: 100,
										borderRadius: 8,
										overflow: 'hidden',
										background: '#f0f0f0',
									}}
								>
									<img
										src={getEventImageUrl(event.BackgroundImageUrl)}
										alt={event.EventName}
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
								</div>
							)}

							{/* Event Info */}
							<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
								<div
									style={{
										fontSize: 20,
										fontWeight: 700,
										color: '#1a1a1a',
										lineHeight: '1.3',
									}}
								>
									{event.EventName}
								</div>
								<div style={{ fontSize: 14, color: '#888' }}>
									{event.EventStartDate && new Date(event.EventStartDate).toLocaleDateString('he-IL')} 📅
								</div>
								<div
									style={{
										fontSize: 13,
										color: '#666',
										background: '#f5f5f5',
										padding: '4px 10px',
										borderRadius: 4,
										display: 'inline-block',
										alignSelf: 'flex-end',
										marginTop: 4,
									}}
								>
									{feedbacks.length} משובים
								</div>
							</div>
						</div>
					</div>

					{/* Feedbacks List */}
					<div style={{ padding: '0 16px 16px' }}>
						{filteredFeedbacks.length === 0 ? (
							<div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
								{feedbacks.length === 0 ? 'אין משובים לאירוע זה' : 'לא נמצאו משובים לפי הסינון הנבחר'}
							</div>
						) : (
							filteredFeedbacks.map((feedback, index) => (
								<div
									key={feedback.Id ?? `${feedback.EventId}-${feedback.CreatedAt}-${index}`}
									style={{
										background: '#fff',
										border: '1px solid #f0f0f0',
										borderRadius: 12,
										padding: '16px',
										marginBottom: 12,
										boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
									}}
								>
									{/* Feedback Header */}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'flex-start',
											marginBottom: 8,
										}}
									>
										<div style={{ textAlign: 'right' }}>
											<div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
												{getCategoryName(feedback.Category)}
											</div>
											<div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
												{new Date(feedback.CreatedAt).toLocaleString('he-IL', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
										</div>
										{renderStars(feedback.Rating)}
									</div>

									{/* Feedback Content */}
									<div
										style={{
											fontSize: 14,
											color: '#444',
											lineHeight: '1.6',
											textAlign: 'right',
											marginTop: 8,
										}}
									>
										{feedback.Content}
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}

			{/* Filter Popup */}
			{showFilterPopup && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
						padding: 16,
					}}
					onClick={() => setShowFilterPopup(false)}
				>
					<div
						style={{
							background: '#fff',
							borderRadius: 16,
							padding: '24px 20px',
							maxWidth: 400,
							width: '100%',
							position: 'relative',
							direction: 'rtl',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close button */}
						<button
							onClick={() => setShowFilterPopup(false)}
							style={{
								position: 'absolute',
								top: 16,
								left: 16,
								background: 'none',
								border: 'none',
								fontSize: 24,
								cursor: 'pointer',
								padding: 0,
								lineHeight: 1,
								color: '#666',
							}}
						>
							×
						</button>

						{/* Title */}
						<h2
							style={{
								margin: '0 0 20px 0',
								fontSize: 20,
								fontWeight: 700,
								textAlign: 'center',
								color: '#1a1a1a',
							}}
						>
                       
							סינון
						</h2>

						{/* Category Pills */}
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								gap: 8,
								marginBottom: 24,
								justifyContent: 'center',
							}}
						>
							{/* Dynamic categories from event */}
							{eventCategories.map((category) => (
								<button
									key={category.Id}
									onClick={() => handleCategoryToggle(category.Name)}
									style={{
										padding: '8px 16px',
										borderRadius: 20,
										border: tempSelectedCategories.includes(category.Name)
											? '2px solid #007AFF'
											: '2px solid #e0e0e0',
										background: tempSelectedCategories.includes(category.Name)
											? '#E3F2FD'
											: '#fff',
										color: tempSelectedCategories.includes(category.Name)
											? '#007AFF'
											: '#666',
										fontSize: 14,
										fontWeight: tempSelectedCategories.includes(category.Name) ? 600 : 400,
										cursor: 'pointer',
										transition: 'all 0.2s',
									}}
								>
									{category.Name}
								</button>
							))}
						</div>

						{/* Action Buttons */}
						<div style={{ display: 'flex', gap: 12 }}>
							<button
								onClick={handleClearFilters}
								style={{
									flex: 1,
									padding: '12px 24px',
									borderRadius: 8,
									border: '1px solid #e0e0e0',
									background: '#fff',
									color: '#666',
									fontSize: 16,
									fontWeight: 600,
									cursor: 'pointer',
								}}
							>
								ניקוי
							</button>
							<button
								onClick={handleApplyFilter}
								style={{
									flex: 1,
									padding: '12px 24px',
									borderRadius: 8,
									border: 'none',
									background: '#007AFF',
									color: '#fff',
									fontSize: 16,
									fontWeight: 600,
									cursor: 'pointer',
								}}
							>
								סינון
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EventFeedbacks;
