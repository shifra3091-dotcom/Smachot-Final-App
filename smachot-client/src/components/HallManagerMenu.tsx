import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearUser } from '../store/userSlice';
import { hallsApi } from '../services/HallsApi';
import { authApi } from '../services/AuthApi';

interface HallDto {
	HallId: number;
	Name: string;
	OwnerUserId?: number;
	ImageUrl?: string;
}

const HallManagerMenu: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [halls, setHalls] = useState<HallDto[]>([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const userId = useAppSelector((state) => state.user.user?.Id);

	// Load halls when drawer opens
	useEffect(() => {
		if (!isOpen || !userId) return;

		setLoading(true);
		hallsApi
			.getHalls()
			.then((allHalls) => {
				const myHalls = allHalls.filter((h: any) => h.OwnerUserId === userId);
				setHalls(myHalls);
			})
			.catch((error) => {
				console.error('Error fetching halls:', error);
			})
			.finally(() => setLoading(false));
	}, [isOpen, userId]);

	const handleHallClick = (hallId: number) => {
		navigate(`/hallmanager/events-simple/${hallId}`);
		setIsOpen(false);
	};

	const handleMyHallsClick = () => {
		navigate('/hallmanager/my-halls-simple');
		setIsOpen(false);
	};

	const handleMyHallsFullClick = () => {
		navigate('/hallmanager/my-halls');
		setIsOpen(false);
	};
	const handleCreateHallClick = () => {
		navigate('/hallmanager/create-hall');
		setIsOpen(false);
	};

	const handleLogout = () => {
		authApi.logout().then(() => {
			dispatch(clearUser());
			navigate('/hallmanager/login');
			setIsOpen(false);
		}).catch((error) => {
			console.error('Error logging out:', error);
			// Still clear user and navigate even if logout fails
			dispatch(clearUser());
			navigate('/hallmanager/login');
			setIsOpen(false);
		});
	};

	// Only show menu if on hall manager pages
	const isHallManagerPage = location.pathname.includes('/hallmanager/');
	console.log('HallManagerMenu - userId:', userId, 'isHallManagerPage:', isHallManagerPage, 'pathname:', location.pathname);
	
	if (!isHallManagerPage) {
		return null;
	}

	return (
		<>
			{/* Menu Icon Button */}
			<button
				onClick={() => setIsOpen(true)}
				style={{
					position: 'fixed',
					top: 16,
					right: 16,
					background: '#fff',
					border: '1px solid #ddd',
					fontSize: 24,
					cursor: 'pointer',
					zIndex: 10000,
					padding: '8px',
					color: '#333',
					display: 'flex',
					flexDirection: 'column',
					gap: 4,
					borderRadius: 4,
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
				}}
				title="תפריט"
			>
				<div style={{ width: 24, height: 3, background: '#333', borderRadius: 2 }} />
				<div style={{ width: 24, height: 3, background: '#333', borderRadius: 2 }} />
				<div style={{ width: 24, height: 3, background: '#333', borderRadius: 2 }} />
			</button>

			{/* Overlay */}
			{isOpen && (
				<div
					onClick={() => setIsOpen(false)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.5)',
						zIndex: 999,
					}}
				/>
			)}

			{/* Drawer */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					right: isOpen ? 0 : '-100%',
					width: 280,
					height: '100vh',
					background: '#fff',
					boxShadow: isOpen ? '-2px 0 8px rgba(0,0,0,0.15)' : 'none',
					zIndex: 1000,
					transition: 'right 0.3s ease',
					overflow: 'auto',
					direction: 'rtl',
				}}
			>
				{/* Close Button */}
				<button
					onClick={() => setIsOpen(false)}
					style={{
						position: 'absolute',
						top: 12,
						left: 12,
						background: 'none',
						border: 'none',
						fontSize: 24,
						cursor: 'pointer',
						padding: '8px',
						color: '#666',
					}}
					title="סגור"
				>
					✕
				</button>

				{/* Header */}
				<div style={{ padding: '60px 16px 24px', borderBottom: '1px solid #f0f0f0' }}>
					<h2
						style={{
							margin: 0,
							fontSize: 18,
							fontWeight: 600,
							color: '#1a1a1a',
							textAlign: 'right',
						}}
					>
						תפריט
					</h2>
				</div>

				{/* My Halls Button */}
				<div
					onClick={handleMyHallsClick}
					style={{
						padding: '16px',
						borderBottom: '1px solid #f0f0f0',
						cursor: 'pointer',
						transition: 'background 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#f5f5f5';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = 'transparent';
					}}
				>
					<div
						style={{
							fontSize: 16,
							fontWeight: 500,
							color: '#1a1a1a',
							textAlign: 'right',
						}}
					>
						האולמות שלי
					</div>
				</div>

				{/* Create Hall Button */}
				{/* My Halls (Full) Button */}
				<div
					onClick={handleMyHallsFullClick}
					style={{
						padding: '16px',
						borderBottom: '1px solid #f0f0f0',
						cursor: 'pointer',
						transition: 'background 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#f5f5f5';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = 'transparent';
					}}
				>
					<div
						style={{
							fontSize: 16,
							fontWeight: 500,
							color: '#1a1a1a',
							textAlign: 'right',
						}}
					>
						האולמות שלי (מלא)
					</div>
				</div>
				<div
					onClick={handleCreateHallClick}
					style={{
						padding: '16px',
						borderBottom: '1px solid #f0f0f0',
						cursor: 'pointer',
						transition: 'background 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#f5f5f5';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = 'transparent';
					}}
				>
					<div
						style={{
							fontSize: 16,
							fontWeight: 500,
							color: '#1a1a1a',
							textAlign: 'right',
						}}
					>
						הוספת אולם
					</div>
				</div>

				{/* Logout Button */}
				<div
					onClick={handleLogout}
					style={{
						padding: '16px',
						borderBottom: '1px solid #f0f0f0',
						cursor: 'pointer',
						transition: 'background 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#f5f5f5';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = 'transparent';
					}}
				>
					<div
						style={{
							fontSize: 16,
							fontWeight: 500,
							color: '#1a1a1a',
							textAlign: 'right',
						}}
					>
						התנתקות
					</div>
				</div>

				{/* Halls List */}
				{loading ? (
					<div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
						טוען...
					</div>
				) : halls.length === 0 ? (
					<div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: 14 }}>
						אין אולמות
					</div>
				) : (
					<div>
						<div
							style={{
								padding: '12px 16px',
								fontSize: 12,
								color: '#999',
								textAlign: 'right',
								textTransform: 'uppercase',
								fontWeight: 600,
							}}
						>
							הארועים שלי
						</div>
						{halls.map((hall) => (
							<div
								key={hall.HallId}
								onClick={() => handleHallClick(hall.HallId)}
								style={{
									padding: '12px 16px',
									borderBottom: '1px solid #f0f0f0',
									cursor: 'pointer',
									transition: 'background 0.2s',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#f5f5f5';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent';
								}}
							>
								<div
									style={{
										fontSize: 14,
										color: '#1a1a1a',
										textAlign: 'right',
										fontWeight: 500,
									}}
								>
									{hall.Name}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
};

export default HallManagerMenu;