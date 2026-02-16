import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setUser, clearUser } from '../../store/userSlice';
import LoginRegister from '../../components/LoginRegister';
import { authApi } from '../../services/AuthApi';
import type { LoginDto, RegisterDto } from '../../services/AuthApi';
import { useNavigate } from 'react-router-dom';

const HallManagerAuth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ Success: boolean; User?: { Name?: string; Id?: number; Email?: string; HallId?: number; hallId?: number; Hall?: { HallId?: number; hallId?: number; Id?: number; id?: number } } } | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const extractHallId = (user: any): number | undefined => {
    const direct = user?.HallId ?? user?.hallId ?? user?.HallID ?? user?.hallID ?? user?.hall_id;
    const hallObj = user?.Hall ?? user?.hall;
    const nested = hallObj?.HallId ?? hallObj?.hallId ?? hallObj?.HallID ?? hallObj?.hallID ?? hallObj?.Id ?? hallObj?.id ?? hallObj?.hall_id;
    return direct ?? nested;
  };

  useEffect(() => {
    (async () => {
      try {
        const result = await authApi.getCurrentUser();
        setCurrentUser(result);
        if (result.Success && result.User) {
          dispatch(setUser(result.User));
          // Redirect to create hall page
          navigate('/hallmanager/create-hall');
          return;
        } else {
          dispatch(clearUser());
        }
      } catch {
        setCurrentUser(null);
        dispatch(clearUser());
      }
    })();
  }, [dispatch]);

  // Handler for login
  const handleLogin = async (loginDto: LoginDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(loginDto);
      console.log('Login result:', result);
      
      if (result.Success && result.User) {
        dispatch(setUser(result.User));
        navigate('/hallmanager/create-hall');
      } else {
        setError(result.Message || 'שגיאה בהתחברות');
      }
    } catch (e) {
      setError('שגיאה בשרת. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for registration
  const handleRegister = async (registerDto: RegisterDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.register(registerDto);
      if (result.Success && result.User) {
        dispatch(setUser(result.User));
        navigate('/hallmanager/create-hall');
      } else {
        setError(result.Message || 'שגיאה בהרשמה');
      }
    } catch (e) {
      setError('שגיאה בשרת. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbfc' }}>
      <div>
        {currentUser && currentUser.Success && currentUser.User ? (
          <div style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 500 }}>
            שלום {currentUser.User.Name || ''}! 
            <br />
            <button
              style={{ marginTop: 16, padding: '8px 24px', fontSize: '1rem', borderRadius: 8, border: 'none', background: '#222', color: '#fff', cursor: 'pointer' }}
              onClick={async () => {
                await authApi.logout();
                dispatch(clearUser());
                window.location.reload();
              }}
            >
              התנתק
            </button>
          </div>
        ) : (
          <LoginRegister
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default HallManagerAuth;
