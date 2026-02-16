import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../services/EventsApi';
import { hallsApi } from '../../services/HallsApi';
import { HallFeedbackApi } from '../../services/HallFeedbackApi';
import type { FeedbackCategory } from '../../services/HallFeedbackApi';
import axiosInstance from '../../services/axiosInstance';
import '../../styles/EventDefinition.css';

interface EventDto {
	EventId: number;
	EventName: string;
	EventStartDate: string;
	EventEndDate: string;
	BackgroundImageUrl?: string;
	ImageUrl?: string;
	Image?: string;
	HallName: string;
	EventTypeId?: number;
	CategoryId?: number;
	SumPayments?: number;
	GoldenBookEntriesCount?: number;
	ImagesCount?: number;
	VideoCount?: number;
	FeedbacksCount?: number;
	Categories?: FeedbackCategory[];
}

interface HallDto {
	HallId: number;
	HallName?: string;
	Name?: string;
}

const ICONS = {
	SumPayments: '₪',
	GoldenBookEntriesCount: '📖',
	ImagesCount: '🖼️',
	VideoCount: '🎥',
	FeedbacksCount: '💬',
};

interface EventTypeDto {
	EventTypeId: number;
	Name?: string;
	EventTypeNameKey?: string;
}

const HallEvents: React.FC = () => {
	const { hallId } = useParams<{ hallId: string }>();
	const navigate = useNavigate();
	const [events, setEvents] = useState<EventDto[]>([]);
	const [hall, setHall] = useState<HallDto | null>(null);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [displayHallName, setDisplayHallName] = useState<string>('');
	const [categories, setCategories] = useState<FeedbackCategory[]>([]);
	
	// Filter state
	const [showFilterPopup, setShowFilterPopup] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
	const [selectedEventTypes, setSelectedEventTypes] = useState<number[]>([]);
	const [filterEventName, setFilterEventName] = useState('');
	const [eventTypes, setEventTypes] = useState<EventTypeDto[]>([]);
	
	// Temporary filter state for popup (only applied when confirming)
	const [tempSelectedCategories, setTempSelectedCategories] = useState<number[]>([]);
	const [tempSelectedEventTypes, setTempSelectedEventTypes] = useState<number[]>([]);
	const [tempFilterEventName, setTempFilterEventName] = useState('');

	// Helper function to get the image URL from different possible property names
	const getEventImageUrl = (event: EventDto): string | undefined => {
		const baseUrl = axiosInstance.defaults.baseURL;
		const imageUrl = event.BackgroundImageUrl || event.ImageUrl || event.Image;
		
		if (!imageUrl) return undefined;
		
		// If it's already a full URL (starts with http), return as is
		if (imageUrl.startsWith('http')) {
			return imageUrl;
		}
		
		// Otherwise, prepend the base URL
		return `${baseUrl}/${imageUrl}`;
	};

	useEffect(() => {
		if (!hallId) return;

		const hallIdNum = parseInt(hallId, 10);
		setLoading(true);

		Promise.all([
			hallsApi.getHall(hallIdNum),
			eventsApi.getPastEventsForHall(hallIdNum),
			hallsApi.getEventTypesForHall(hallIdNum),
			HallFeedbackApi.getFeedbackCategories()
		])
			.then(async ([hallData, eventsData, eventTypesData, categoriesData]) => {
				// console.log('Hall data full object:', JSON.stringify(hallData, null, 2));
				// console.log('Events data first item:', JSON.stringify(eventsData?.[0], null, 2));
				setHall(hallData);
				setEventTypes(eventTypesData || []);
				setCategories(categoriesData || []);
				
				// Update display name immediately when data arrives
				let hallNameToDisplay = 'אולם';
				if (eventsData && eventsData.length > 0 && eventsData[0].HallName) {
					hallNameToDisplay = `אולם ${eventsData[0].HallName}`;
				} else if (hallData?.HallName) {
					hallNameToDisplay = `אולם ${hallData.HallName}`;
				} else if (hallData?.Name) {
					hallNameToDisplay = `אולם ${hallData.Name}`;
				}
				setDisplayHallName(hallNameToDisplay);
				
				// Fetch feedbacks count and categories for each event
				const eventsWithFeedbackCount = await Promise.all(
					(eventsData || []).map(async (event: EventDto) => {
						try {
							const [feedbacks, categories] = await Promise.all([
								HallFeedbackApi.getFeedbacksForEvent(event.EventId),
								HallFeedbackApi.getCategoriesForEvent(event.EventId)
							]);
							return {
								...event,
								FeedbacksCount: feedbacks?.length || 0,
								Categories: categories || []
							};
						} catch (error) {
							console.error(`Error fetching data for event ${event.EventId}:`, error);
							return event;
						}
					})
				);
				
				setEvents(eventsWithFeedbackCount);
			})
			.catch((error) => {
				console.error('Error fetching hall or events:', error);
			})
			.finally(() => setLoading(false));
	}, [hallId]);

	// Handle category toggle (temp)
	const handleCategoryToggle = (categoryId: number) => {
		if (tempSelectedCategories.includes(categoryId)) {
			setTempSelectedCategories(tempSelectedCategories.filter(id => id !== categoryId));
		} else {
			setTempSelectedCategories([...tempSelectedCategories, categoryId]);
		}
	};

	// Handle event type toggle (temp)
	const handleEventTypeToggle = (eventTypeId: number) => {
		if (tempSelectedEventTypes.includes(eventTypeId)) {
			setTempSelectedEventTypes(tempSelectedEventTypes.filter(id => id !== eventTypeId));
		} else {
			setTempSelectedEventTypes([...tempSelectedEventTypes, eventTypeId]);
		}
	};

	// Apply filters when clicking confirm button
	const handleApplyFilter = () => {
		setSelectedCategories(tempSelectedCategories);
		setSelectedEventTypes(tempSelectedEventTypes);
		setFilterEventName(tempFilterEventName);
		setShowFilterPopup(false);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setTempSelectedCategories([]);
		setTempSelectedEventTypes([]);
		setTempFilterEventName('');
		setSelectedCategories([]);
		setSelectedEventTypes([]);
		setFilterEventName('');
	};

	// Filter events based on all criteria
	const filteredEvents = events.filter((event) => {
		// Search query filter
		const matchesSearch = event.EventName.toLowerCase().includes(searchQuery.toLowerCase());
		
		// Category filter - check if event has feedbacks in selected categories
		const matchesCategory = selectedCategories.length === 0 || 
			(event.Categories && event.Categories.some(cat => selectedCategories.includes(cat.Id)));
		
		// Event type filter
		const matchesEventType = selectedEventTypes.length === 0 || 
			(event.EventTypeId && selectedEventTypes.includes(event.EventTypeId));
		
		// Event name filter from popup
		const matchesFilterName = filterEventName === '' || 
			event.EventName.toLowerCase().includes(filterEventName.toLowerCase());
		
		return matchesSearch && matchesCategory && matchesEventType && matchesFilterName;
	});

	return (
		<div style={{ direction: 'rtl', background: '#fff', minHeight: '100vh', padding: 0 }}>
			{/* Mobile status bar space */}
			<div style={{ height: 44, background: '#fff' }} />
			
			{/* Header */}
			<div
				style={{
					padding: '24px 16px 20px',
					borderBottom: '1px solid #f0f0f0',
					marginBottom: 24,
					textAlign: 'right',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<h1
					style={{
						fontWeight: 700,
						fontSize: 32,
						margin: 0,
						color: '#1a1a1a',
						lineHeight: '1.3',
					}}
				>
					{displayHallName}
				</h1>
				
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

			{/* Search Bar */}
			<div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 16px' }}>
				<div
					style={{
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<input
						type="text"
						placeholder="חיפוש ארוע לפי שם"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{
							width: '100%',
							padding: '12px 45px 12px 16px',
							fontSize: 16,
							border: '1px solid #e0e0e0',
							borderRadius: 8,
							outline: 'none',
							direction: 'rtl',
							background: '#f9f9f9',
						}}
					/>
					<span
						style={{
							position: 'absolute',
							right: 16,
							fontSize: 18,
							color: '#999',
							pointerEvents: 'none',
						}}
					>
						🔍
					</span>
				</div>
			</div>

			<div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				{loading ? (
					<div style={{ textAlign: 'center', marginTop: 40 }}>טוען...</div>
				) : filteredEvents.length === 0 ? (
					<div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
						{searchQuery ? 'לא נמצאו אירועים התואמים לחיפוש' : 'אין אירועים באולם זה'}
					</div>
				) : (
					filteredEvents.map((event) => {
						return (
							<div
								key={event.EventId}
								style={{
									background: '#fff',
									borderRadius: 12,
									marginBottom: 16,
									padding: '12px 16px',
									boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
									width: '100%',
									maxWidth: 560,
									display: 'flex',
									flexDirection: 'row-reverse',
									alignItems: 'center',
									gap: 12,
									cursor: 'pointer',
									transition: 'box-shadow 0.2s',
									border: '1px solid #f0f0f0',
								}}
								onClick={() => navigate(`/hallmanager/event-feedbacks/${event.EventId}`)}
								onMouseEnter={(e) => {
									e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
								}}
							>
								{/* Image - Right side (RTL) */}
								<div
									style={{
										width: 80,
										height: 80,
										minWidth: 80,
										borderRadius: 8,
										background: '#f0f0f0',
										overflow: 'hidden',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 12,
										color: '#999',
									}}
								>
									{getEventImageUrl(event) ? (
										<img
											src={getEventImageUrl(event)}
											alt={event.EventName}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
											}}
										/>
									) : (
										<span>תמונה</span>
									)}
								</div>

								{/* Content - Left side (RTL) */}
								<div
									style={{
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
										gap: 6,
										alignItems: 'flex-end',
									}}
								>
									<div
										style={{
											fontWeight: 600,
											fontSize: 16,
											color: '#1a1a1a',
											lineHeight: '1.4',
										}}
									>
										{event.EventName}
									</div>
									<div style={{ color: '#888', fontSize: 13 }}>
										{event.EventStartDate && new Date(event.EventStartDate).toLocaleDateString('he-IL')}
									</div>
									<div style={{ display: 'flex', gap: 16, color: '#666', fontSize: 13, alignItems: 'center' }}>
										{event.ImagesCount !== undefined && <span title="תמונות">{ICONS.ImagesCount} {event.ImagesCount}</span>}
										{event.VideoCount !== undefined && <span title="סרטונים">{ICONS.VideoCount} {event.VideoCount}</span>}
										{event.FeedbacksCount !== undefined && event.FeedbacksCount > 0 && (
											<span title="משובים">{ICONS.FeedbacksCount} {event.FeedbacksCount}</span>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

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
							maxHeight: '80vh',
							overflowY: 'auto',
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

						{/* Category Section */}
						<div style={{ marginBottom: 20 }}>
							<div
								style={{
									fontSize: 14,
									color: '#999',
									marginBottom: 8,
									textAlign: 'right',
								}}
							>
								קטגוריה
							</div>
							<div
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 8,
									justifyContent: 'flex-end',
								}}
							>
								{categories.map((category) => (
									<button
										key={category.Id}
										onClick={() => handleCategoryToggle(category.Id)}
										style={{
											padding: '8px 16px',
											borderRadius: 20,
											border: tempSelectedCategories.includes(category.Id)
												? '2px solid #007AFF'
												: '2px solid #e0e0e0',
											background: tempSelectedCategories.includes(category.Id)
												? '#E3F2FD'
												: '#fff',
											color: tempSelectedCategories.includes(category.Id)
												? '#007AFF'
												: '#666',
											fontSize: 14,
											fontWeight: tempSelectedCategories.includes(category.Id) ? 600 : 400,
											cursor: 'pointer',
											transition: 'all 0.2s',
										}}
									>
										{category.Name}
									</button>
								))}
							</div>
						</div>

						{/* Event Type Section */}
						<div style={{ marginBottom: 20 }}>
							<div
								style={{
									fontSize: 14,
									color: '#999',
									marginBottom: 8,
									textAlign: 'right',
								}}
							>
								סוג האירוע
							</div>
							<div
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 8,
									justifyContent: 'flex-end',
								}}
							>
							{eventTypes.map((eventType, index) => (
								<button
									key={`${eventType.EventTypeId}-${index}`}
									onClick={() => handleEventTypeToggle(eventType.EventTypeId)}
									style={{
										padding: '8px 16px',
										borderRadius: 20,
										border: tempSelectedEventTypes.includes(eventType.EventTypeId)
											? '2px solid #007AFF'
											: '2px solid #e0e0e0',
										background: tempSelectedEventTypes.includes(eventType.EventTypeId)
											? '#E3F2FD'
											: '#fff',
										color: tempSelectedEventTypes.includes(eventType.EventTypeId)
											? '#007AFF'
											: '#666',
										fontSize: 14,
										fontWeight: tempSelectedEventTypes.includes(eventType.EventTypeId) ? 600 : 400,
										cursor: 'pointer',
										transition: 'all 0.2s',
									}}
								>
										{eventType.EventTypeNameKey || eventType.Name || 'Unknown'}
								</button>
							))}
					</div>
				</div>

				{/* Event Name Filter */}
				<div style={{ marginBottom: 24 }}>
					<div
						style={{
							fontSize: 14,
							color: '#999',
							marginBottom: 8,
							textAlign: 'right',
						}}
					>
					שם האירוע
					</div>
					<input
						type="text"
						placeholder="כתוב את שם האירוע"
						value={filterEventName}
						onChange={(e) => setFilterEventName(e.target.value)}
						style={{
							width: '100%',
							padding: '12px 16px',
							fontSize: 14,
							border: '1px solid #e0e0e0',
							borderRadius: 8,
							outline: 'none',
							direction: 'rtl',
							background: '#fff',
						}}
					/>
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
						background: '#000',
						color: '#fff',
						fontSize: 16,
						fontWeight: 600,
						cursor: 'pointer',
					}}
				>
					אישור
				</button>
			</div>
		</div>
	</div>
)}
</div>
	);
};

export default HallEvents;
