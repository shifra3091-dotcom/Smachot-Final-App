import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../services/EventsApi';
import { MediaApi } from '../../services/MediaApi';
import { getMediaGroupedByAlbum } from '../../services/AlbumsApi';
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

interface AlbumGroup {
	AlbumName: string;
	Images: Array<{ Id: number; Url: string; }>;
	Videos: Array<{ Id: number; Url: string; }>;
}

const ICONS = {
	SumPayments: '₪',
	GoldenBookEntriesCount: '📖',
	ImagesCount: '🖼️',
	VideoCount: '🎥',
};

const EventDetails: React.FC = () => {
	const { eventId } = useParams<{ eventId: string }>();
	const navigate = useNavigate();
	const [event, setEvent] = useState<EventDto | null>(null);
	const [albums, setAlbums] = useState<AlbumGroup[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!eventId) return;
		setLoading(true);
		   eventsApi.getEvents(Number(eventId)).then(setEvent);
		   getMediaGroupedByAlbum(Number(eventId),false).then((data: any) => {
			   // Transform response to AlbumGroup[]
			   const albums: AlbumGroup[] = (data || []).map((album: any) => ({
				   AlbumName: album.AlbumName,
				   Images: album.MediaItems.filter((x: any) => x.MediaType === 'Image'),
				   Videos: album.MediaItems.filter((x: any) => x.MediaType === 'Video'),
			   }));
			   setAlbums(albums);
		   }).finally(() => setLoading(false));
	}, [eventId]);

	// Calculate days left for download
	let daysLeft = null;
	let isDownloadable = false;
	if (event) {
		const endDate = new Date(event.EventEndDate);
		const endDatePlus30 = new Date(endDate);
		endDatePlus30.setDate(endDatePlus30.getDate() + 30);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const hasEventEnded = today > endDate;
		const diffInMs = endDatePlus30.getTime() - today.getTime();
		const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
		daysLeft = diffInDays;
		isDownloadable = hasEventEnded && daysLeft >= 0;
	}

	return (
		<div style={{ direction: 'rtl', background: '#fff', minHeight: '100vh', padding: 0 }}>
			<div style={{ height: 32 }} />
			<h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, margin: '12px 0 18px' }}>אזור אישי</h2>
			{loading ? (
				<div style={{ textAlign: 'center', marginTop: 40 }}>טוען...</div>
			) : event ? (
				<div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
							<div style={{ fontWeight: 700, fontSize: 18 }}>{event.EventName}</div>
							{(() => {
								const today = new Date();
								const eventStartDate = new Date(event.EventStartDate);
								today.setHours(0, 0, 0, 0);
								eventStartDate.setHours(0, 0, 0, 0);
								return today < eventStartDate ? (
									<div 
										style={{ fontSize: 24, color: '#ccc', cursor: 'pointer' }}
										onClick={() => navigate(`/eventowner/event-definition?eventId=${eventId}`)}
									>
										<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M2.5 5.8335H5" stroke="#878787" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M2.5 14.1665H7.5" stroke="#878787" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M15 14.1665H17.5" stroke="#878787" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M12.5 5.8335H17.5" stroke="#878787" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M5 5.8335C5 5.05693 5 4.66865 5.12687 4.36235C5.29602 3.95398 5.62048 3.62952 6.02886 3.46036C6.33515 3.3335 6.72343 3.3335 7.5 3.3335C8.27657 3.3335 8.66483 3.3335 8.97117 3.46036C9.3795 3.62952 9.704 3.95398 9.87317 4.36235C10 4.66865 10 5.05693 10 5.8335C10 6.61006 10 6.99835 9.87317 7.30464C9.704 7.71301 9.3795 8.03747 8.97117 8.20663C8.66483 8.3335 8.27657 8.3335 7.5 8.3335C6.72343 8.3335 6.33515 8.3335 6.02886 8.20663C5.62048 8.03747 5.29602 7.71301 5.12687 7.30464C5 6.99835 5 6.61006 5 5.8335Z" stroke="#878787" strokeWidth="1.3"/>
											<path d="M10 14.1665C10 13.3899 10 13.0017 10.1268 12.6953C10.296 12.287 10.6205 11.9625 11.0288 11.7933C11.3352 11.6665 11.7234 11.6665 12.5 11.6665C13.2766 11.6665 13.6648 11.6665 13.9712 11.7933C14.3795 11.9625 14.704 12.287 14.8732 12.6953C15 13.0017 15 13.3899 15 14.1665C15 14.9431 15 15.3313 14.8732 15.6377C14.704 16.046 14.3795 16.3705 13.9712 16.5397C13.6648 16.6665 13.2766 16.6665 12.5 16.6665C11.7234 16.6665 11.3352 16.6665 11.0288 16.5397C10.6205 16.3705 10.296 16.046 10.1268 15.6377C10 15.3313 10 14.9431 10 14.1665Z" stroke="#878787" strokeWidth="1.3"/>
										</svg>
									</div>
								) : null;
							})()}
						</div>
					{/* Event Details Card */}
					<div style={{ 
						background: '#f8f8f8', 
						borderRadius: 12, 
						padding: '16px', 
						marginBottom: 24,
						border: '1px solid #e0e0e0'
					}}>
						
						
						{event.EventEndDate && isDownloadable && (
							<div style={{ 
								color: '#666', 
								fontSize: 14, 
								marginBottom: 8,
								fontWeight: 500
							}}>
								זמן אחסון נותר: {daysLeft} ימים
							</div>
						)}
						
						<div style={{ 
							color: '#888', 
							fontSize: 13, 
							marginBottom: 12
						}}>
							האירוע יפוג ב: {new Date(event.EventEndDate).toLocaleDateString('he-IL')}
						</div>
						
						
					</div>
                    <button style={{ 
							width: '100%', 
							background: '#f0f0f0', 
							color: '#333', 
							fontWeight: 500, 
							fontSize: 14, 
							borderRadius: 8, 
							padding: '10px 0', 
							border: '1px solid #ddd', 
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px'
						}}>
							<span>⬇</span>
							הורדת כל האירוע
						</button>
					{/* Albums Section */}
					<div style={{ marginBottom: 24 }}>
						<div style={{ textAlign: 'center', fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#333' }}>האלבומים שלי</div>
						<div style={{ textAlign: 'center', fontSize: 14, color: '#888', marginBottom: 16 }}>{albums.length} אלבומים</div>
						{albums.map((album, idx) => (
							<div key={idx} style={{ 
								background: '#fff', 
								borderRadius: 12, 
								marginBottom: 8, 
								padding: '16px', 
								border: '1px solid #e0e0e0',
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'space-between' 
							}}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									<div style={{ fontSize: 20, color: '#ddd' }}>📁</div>
									<div>
										<div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>{album.AlbumName}</div>
										<div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#666' }}>
											<span>📷 {album.Images.length}</span>
											<span>🎥 {album.Videos.length}</span>
										</div>
									</div>
								</div>
								<div style={{ fontSize: 16, color: '#ccc' }}>❯</div>
							</div>
						))}
					</div>
					
					{/* Bottom Section */}
					<div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
						<div style={{ 
							flex: 1, 
							background: '#f8f8f8', 
							borderRadius: 12, 
							padding: '20px 16px', 
							textAlign: 'center',
							border: '1px solid #e0e0e0'
						}}>
							<div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>מתנות</div>
						</div>
						<div style={{ 
							flex: 1, 
							background: '#f8f8f8', 
							borderRadius: 12, 
							padding: '16px', 
							textAlign: 'center',
							border: '1px solid #e0e0e0',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 8
						}}>
							<div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>Golden Book</div>
							<div style={{ 
								background: '#fff', 
								border: '1px solid #ddd', 
								borderRadius: 6, 
								padding: '6px 12px', 
								fontSize: 12, 
								color: '#666',
								display: 'flex',
								alignItems: 'center',
								gap: 4
							}}>
								<span>📖</span>
								Golden Book<br/>ספר הברכות שלי
							</div>
						</div>
					</div>
					
					{/* Download Button */}
					<button style={{ 
						width: '100%', 
						background: '#000', 
						color: '#fff', 
						fontWeight: 500, 
						fontSize: 16, 
						borderRadius: 12, 
						padding: '14px 0', 
						border: 'none', 
						cursor: 'pointer'
					}}>
						הורדת כל התוכן
					</button>

				</div>
			) : (
				<div style={{ textAlign: 'center', marginTop: 40 }}>אירוע לא נמצא</div>
			)}
		</div>
	);
};

export default EventDetails;
