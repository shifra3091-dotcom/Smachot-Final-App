import { useEffect, useState } from 'react';
import { hallsApi } from '../services/HallsApi';
import type { Hall } from '../types/Hall';
import { useTranslation } from '../hooks/useTranslation';

export function HallsList() {
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    
    useEffect(() => {
        hallsApi.getHalls()
            .then(data => {
                console.log('Received data from server:', data);
                setHalls(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Failed to load halls');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="halls-list">
            <h1>{t('Translate', 'Translate')}</h1>
            <h1>Halls</h1>
            <div className="halls-grid">
                {halls.map(hall => (
                    <div key={hall.HallId} className="hall-card">
                        <h3>{hall.Name}</h3>
                        <p>ID: {hall.HallId}</p>
                        <p>Owner: {hall.OwnerUserName}</p>
                        {hall.EventsCount !== undefined && <p>Events: {hall.EventsCount}</p>}
                        {hall.CreatedAt && <p>Created: {new Date(hall.CreatedAt).toLocaleDateString()}</p>}
                        {hall.QrCodeSource && <img src={hall.QrCodeSource} alt={`QR code for ${hall.Name}`} />}
                    </div>
                ))}
            </div>
        </div>
    );
}