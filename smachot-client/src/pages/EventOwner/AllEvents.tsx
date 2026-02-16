import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { eventsApi } from '../../services/EventsApi';
import '../../styles/EventDefinition.css';

interface EventDto {
	EventId: number;
	EventName: string;
	EventStartDate: string;
	EventEndDate: string;
	BackgroundImageUrl?: string;
	HallName: string;
	SumPayments: number;
	GoldenBookEntriesCount: number;
	ImagesCount: number;
	VideoCount: number;
}

const ICONS = {
	SumPayments: '₪',
	GoldenBookEntriesCount: '📖',
	ImagesCount: '🖼️',
	VideoCount: '🎥',
};

const AllEvents: React.FC = () => {
	const userId = useAppSelector((state) => state.user.user?.Id);
    
	const navigate = useNavigate();
	const [events, setEvents] = useState<EventDto[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!userId) return;
		setLoading(true);
		eventsApi
			.getEventsForUser(userId)
			.then(data => {
				const sortedEvents = data.sort((a, b) => {
					const dateA = new Date(a.EventStartDate);
					const dateB = new Date(b.EventStartDate);
					return dateA.getTime() - dateB.getTime();
				});
				setEvents(sortedEvents);
			})
			.finally(() => setLoading(false));
	}, [userId]);

	return (
		<div style={{ direction: 'rtl', background: '#fff', minHeight: '100vh', padding: 0 }}>
			{/* Simulate mobile header */}
			<div style={{ height: 32 }} />
			<h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, margin: '12px 0 18px' }}>אזור אישי</h2>
			<div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 16px 16px' }}>
				<button
					style={{
						background: '#f5f5f5',
						border: 'none',
						borderRadius: 8,
						padding: '8px 18px',
						fontSize: 16,
						fontWeight: 500,
						cursor: 'pointer',
						boxShadow: '0 1px 2px #0001',
					}}
					onClick={() => navigate('/eventowner/event-definition')}
				>
					+ אירוע חדש
				</button>
			</div>
			   <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				{loading ? (
					<div style={{ textAlign: 'center', marginTop: 40 }}>טוען...</div>
				) : (
					   events.map((event) => {
						   // Calculate days left for download (example logic)
						   const endDate = new Date(event.EventEndDate);
						   // מוסיפים 30 יום
						   const endDatePlus30 = new Date(endDate);
						   endDatePlus30.setDate(endDatePlus30.getDate() + 30);

						   // היום
						   const today = new Date();
						   today.setHours(0, 0, 0, 0);

						   // Show download warning only if EventEndDate has passed
						   const hasEventEnded = today > endDate;
						   const diffInMs = endDatePlus30.getTime() - today.getTime();
						   const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
						   const daysLeft = diffInDays;
						   const isDownloadable = hasEventEnded && daysLeft >= 0;
						   return (
							   <div
								   key={event.EventId}
								   style={{
									   background: '#f7f7f7',
									   borderRadius: 18,
									   marginBottom: 24,
									   padding: '24px 32px 16px',
									   boxShadow: '0 4px 16px #0002',
									   width: '100%',
									   maxWidth: 520,
									   minWidth: 320,
									   display: 'flex',
									   flexDirection: 'column',
									   alignItems: 'flex-start',
									   cursor: 'pointer',
									   transition: 'box-shadow 0.2s',
								   }}
								   onClick={() => navigate(`/eventowner/event-details/${event.EventId}`)}
							   >
								   <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
									   <div style={{ fontWeight: 700, fontSize: 20 }}>{event.EventName}</div>
									   {event.EventEndDate && isDownloadable && (
										   <div style={{ color: 'red', fontSize: 15, fontWeight: 600, marginLeft: 8, whiteSpace: 'nowrap' }}>
											   נותרו {daysLeft} ימים להורדה
										   </div>
									   )}
								   </div>
								   <div style={{ color: '#666', fontSize: 16, marginBottom: 2 }}>{event.HallName && `אולם "${event.HallName}"`}</div>
								   <div style={{ color: '#888', fontSize: 15, marginBottom: 12 }}>
									   {event.EventStartDate && new Date(event.EventStartDate).toLocaleDateString('he-IL')}
								   </div>
								   <div style={{ display: 'flex', gap: 28, color: '#444', fontSize: 17, alignItems: 'center', marginTop: 10 }}>
									   <span title="סכום מתנות">{ICONS.SumPayments} {event.SumPayments?.toLocaleString('he-IL')}</span>
									   <span title="ברכות בספר הזהב">{ICONS.GoldenBookEntriesCount} {event.GoldenBookEntriesCount}</span>
									   <span title="תמונות">{ICONS.ImagesCount} {event.ImagesCount}</span>
									   <span title="סרטונים">{ICONS.VideoCount} {event.VideoCount}</span>
								   </div>
							   </div>
						   );
					})
				)}
			</div>
		</div>
	);
};

export default AllEvents;
