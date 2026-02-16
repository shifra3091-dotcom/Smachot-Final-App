import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../services/EventsApi';
import { hallsApi } from '../../services/HallsApi';
import axiosInstance from '../../services/axiosInstance';

interface EventDto {
	EventId: number;
	EventName: string;
	EventStartDate: string;
	EventEndDate: string;
	BackgroundImageUrl?: string;
	ImageUrl?: string;
	Image?: string;
	HallName: string;
}

const HallEventsSimple: React.FC = () => {
	const { hallId } = useParams<{ hallId: string }>();
	const navigate = useNavigate();
	const [events, setEvents] = useState<EventDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [displayHallName, setDisplayHallName] = useState<string>('');
	const [activeTab, setActiveTab] = useState<'all' | 'past' | 'future'>('all');

	const getEventImageUrl = (event: EventDto): string | undefined => {
		const baseUrl = axiosInstance.defaults.baseURL;
		const imageUrl = event.BackgroundImageUrl || event.ImageUrl || event.Image;

		if (!imageUrl) return undefined;

		if (imageUrl.startsWith('http')) {
			return imageUrl;
		}

		return `${baseUrl}/${imageUrl}`;
	};

	const formatDate = (dateString: string): string => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('he-IL', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		} catch {
			return dateString;
		}
	};

	const parseEventDate = (dateString?: string) => {
		if (!dateString) return null;
		const parsed = new Date(dateString);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	};

	const now = new Date();
	const filteredEvents = events.filter((event) => {
		if (activeTab === 'all') return true;

		const startDate = parseEventDate(event.EventStartDate);
		const endDate = parseEventDate(event.EventEndDate);

		if (!startDate || !endDate) return false;

		const isPast = endDate < now;
		const isFuture = startDate > now;
		const isOngoing = startDate <= now && endDate >= now;

		if (activeTab === 'past') return isPast;
		return isFuture || isOngoing;
	});

	useEffect(() => {
		if (!hallId) return;

		const hallIdNum = parseInt(hallId, 10);
		setLoading(true);

		Promise.all([
			hallsApi.getHall(hallIdNum),
			eventsApi.getEventsForHall(hallIdNum)
		])
			.then(([hallData, eventsData]) => {
				let hallNameToDisplay = 'אולם';
				if (eventsData && eventsData.length > 0 && eventsData[0].HallName) {
					hallNameToDisplay = `אולם ${eventsData[0].HallName}`;
				} else if (hallData?.HallName) {
					hallNameToDisplay = `אולם ${hallData.HallName}`;
				} else if (hallData?.Name) {
					hallNameToDisplay = `אולם ${hallData.Name}`;
				}
				setDisplayHallName(hallNameToDisplay);

				setEvents(eventsData || []);
			})
			.catch((error) => {
				console.error('HallEventsSimple: Error fetching hall or events:', error);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [hallId]);

	return (
		<div style={{ direction: 'rtl', background: '#0b0b0b', minHeight: '100vh', padding: 0 }}>
			<div style={{ height: 44, background: '#0b0b0b' }} />

			<div
				style={{
					padding: '16px 16px 12px',
					borderBottom: '1px solid #1f1f1f',
					marginBottom: 8,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<h2
					style={{
						textAlign: 'right',
						fontWeight: 700,
						fontSize: 24,
						margin: 0,
						color: '#e7c35f',
						flex: 1,
					}}
				>
					{displayHallName}
				</h2>
				<button
					onClick={() => navigate('/hallmanager/my-halls')}
					style={{
						background: 'none',
						border: 'none',
						fontSize: 24,
						cursor: 'pointer',
						padding: '8px',
						color: '#e7c35f',
					}}
					title="חזרה"
				>
					←
				</button>
			</div>

			<div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 12px' }}>
				<div
					style={{
						display: 'flex',
						gap: 10,
						justifyContent: 'center',
						flexWrap: 'wrap',
					}}
				>
					{[
						{ key: 'all', label: 'כל הארועים' },
						{ key: 'past', label: 'ארועים שהיו' },
						{ key: 'future', label: 'ארועים עתידניים' },
					].map((tab) => {
						const isActive = activeTab === tab.key;
						return (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key as 'all' | 'past' | 'future')}
								style={{
									borderRadius: 999,
									border: `1px solid ${isActive ? '#e7c35f' : '#3a3a3a'}`,
									background: isActive ? '#e7c35f' : 'transparent',
									color: isActive ? '#0b0b0b' : '#e7c35f',
									padding: '8px 16px',
									fontSize: 14,
									fontWeight: 600,
									cursor: 'pointer',
								}}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>

			<div
				style={{
					maxWidth: 640,
					margin: '0 auto',
					padding: '0 16px 32px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center'
				}}
			>
				{loading ? (
					<div style={{ textAlign: 'center', marginTop: 40, color: '#a9a9a9' }}>טוען...</div>
				) : events.length === 0 ? (
					<div style={{ textAlign: 'center', marginTop: 40, color: '#a9a9a9' }}>אין ארועים באולם זה</div>
				) : filteredEvents.length === 0 ? (
					<div style={{ textAlign: 'center', marginTop: 40, color: '#a9a9a9' }}>אין ארועים לקטגוריה זו</div>
				) : (
					filteredEvents.map((event) => {
						const imageUrl = getEventImageUrl(event);

						return (
							<div
								key={event.EventId}
								style={{
									background: '#1a1a1a',
									borderRadius: 16,
									marginBottom: 14,
									padding: '12px 14px',
									boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
									width: '100%',
									maxWidth: 600,
									display: 'flex',
									flexDirection: 'row-reverse',
									alignItems: 'center',
									gap: 12,
									border: '1px solid #2a2a2a',
								}}
							>
								<div
									style={{
										width: 72,
										height: 72,
										minWidth: 72,
										borderRadius: 12,
										background: '#2a2a2a',
										overflow: 'hidden',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 12,
										color: '#a9a9a9',
									}}
								>
									{imageUrl ? (
										<img
											src={imageUrl}
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

								<div
									style={{
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
										gap: 4,
										alignItems: 'flex-end',
									}}
								>
									<div
										style={{
											fontWeight: 700,
											fontSize: 16,
											color: '#f2f2f2',
											lineHeight: '1.4',
										}}
									>
										{event.EventName}
									</div>
									<div
										style={{
											fontSize: 14,
											color: '#a9a9a9',
										}}
									>
										{formatDate(event.EventStartDate)}
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default HallEventsSimple;
