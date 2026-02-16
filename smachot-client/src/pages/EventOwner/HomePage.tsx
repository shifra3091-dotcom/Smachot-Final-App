
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import explainVideo from '../../assets/Login/explain.mp4';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div style={{ direction: 'rtl', textAlign: 'center', minHeight: '100vh', background: '#fff' }}>
            <div style={{ height: 40 }} />
            <h2 style={{ marginTop: 40, fontWeight: 400 }}>ברוכים הבאים</h2>
            <div style={{ fontSize: 20, color: '#666', marginBottom: 40 }}>
                לאפליקציית השמחות שלכם
            </div>
            <div style={{ margin: '0 auto', maxWidth: 320 }}>
                <div style={{ color: '#888', fontSize: 16, marginBottom: 8 }}>
                    וידאו הסבר קצר  איך להשתמש באפליקציה
                </div>
                <video
                    width="100%"
                    height="180"
                    controls
                    style={{ borderRadius: 8, background: '#000' }}
                >
                    <source src={explainVideo} type="video/mp4" />
                    הדפדפן שלך אינו תומך בניגון וידאו.
                </video>
            </div>
            <div style={{ height: 120 }} />
            <button
                style={{
                    width: 300,
                    height: 48,
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 500,
                    margin: '0 auto',
                    display: 'block',
                    cursor: 'pointer',
                }}
                onClick={() => navigate('/eventowner/login')}
            >
                התחברות / הרשמה
            </button>
        </div>
    );
};

export default HomePage;
