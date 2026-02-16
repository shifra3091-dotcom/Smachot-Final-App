import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { hallsApi } from '../../services/HallsApi';

interface HallDto {
	HallId: number;
	Name: string;
	OwnerUserId?: number;
	OwnerUserName?: string;
	ImageUrl?: string;
	Category?: string;
}

const MyHallsSimple: React.FC = () => {
	const userId = useAppSelector((state) => state.user.user?.Id);
	const navigate = useNavigate();
	const [halls, setHalls] = useState<HallDto[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!userId) return;
		setLoading(true);
		hallsApi
			.getHalls()
			.then((allHalls) => {
				// Filter halls by current user
				const myHalls = allHalls.filter((h: any) => h.OwnerUserId === userId);
				setHalls(myHalls);
			})
			.catch((error) => {
				console.error('Error fetching halls:', error);
			})
			.finally(() => setLoading(false));
	}, [userId]);

	return (
		<div style={{ direction: 'rtl', background: '#fff', minHeight: '100vh', padding: 0 }}>
			{/* Mobile status bar space */}
			<div style={{ height: 44, background: '#fff' }} />
			
			{/* Header */}
			<div
				style={{
					padding: '16px 16px',
					borderBottom: '1px solid #f0f0f0',
					marginBottom: 12,
				}}
			>
				<h2
					style={{
						textAlign: 'right',
						fontWeight: 700,
						fontSize: 24,
						margin: 0,
						color: '#1a1a1a',
					}}
				>
					האולמות שלי
				</h2>
			</div>

			<div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				{loading ? (
					<div style={{ textAlign: 'center', marginTop: 40 }}>טוען...</div>
				) : halls.length === 0 ? (
					<div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>אין אולמות משוייכים</div>
				) : (
					halls.map((hall) => {
						return (
							<div
								key={hall.HallId}
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
								onClick={() => navigate(`/hallmanager/events-simple/${hall.HallId}`)}
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
									{hall.ImageUrl ? (
										<img
											src={hall.ImageUrl}
											alt={hall.Name}
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
										gap: 4,
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
										{hall.Name}
									</div>
									{hall.Category && (
										<div
											style={{
												fontSize: 12,
												color: '#666',
												background: '#f5f5f5',
												padding: '3px 8px',
												borderRadius: 4,
												display: 'inline-block',
											}}
										>
											{hall.Category}
										</div>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default MyHallsSimple;
