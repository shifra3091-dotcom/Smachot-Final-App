import React, { useState, useEffect } from 'react';
import { authApi } from '../services/AuthApi';
import type { User } from '../types/User';

import '../styles/Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const getPasswordChecks = (value: string) => ({
        lower: /[a-z]/.test(value),
        upper: /[A-Z]/.test(value),
        digit: /\d/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
        length: value.length >= 8
    });

    const validatePassword = (value: string) => {
        if (!value) {
            return 'נא להזין סיסמה.';
        }

        const checks = getPasswordChecks(value);
        if (checks.lower && checks.upper && checks.digit && checks.special && checks.length) {
            return '';
        }

        return 'הסיסמה חייבת לכלול אות קטנה, אות גדולה, מספר, תו מיוחד ולפחות 8 תווים.';
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const result = await authApi.getCurrentUser();
            if (result.Success && result.User) {
                setIsLoggedIn(true);
                setCurrentUser(result.User);
            }
        } catch (err) {
            // Not authenticated
            setIsLoggedIn(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const nextPasswordError = validatePassword(password);
        setPasswordError(nextPasswordError);
        if (nextPasswordError) {
            return;
        }
        setLoading(true);

        try {
            const result = await authApi.login({ email, password });
            
            if (result.Success) {
                setIsLoggedIn(true);
                setCurrentUser(result.User || null);
                // Fetch current user details if not included in login response
                if (!result.User) {
                    const userResult = await authApi.getCurrentUser();
                    if (userResult.Success && userResult.User) {
                        setCurrentUser(userResult.User);
                    }
                }
            } else {
                setError(result.Message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.Message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            setIsLoggedIn(false);
            setCurrentUser(null);
            setEmail('');
            setPassword('');
        } catch (err) {
            setError('An error occurred during logout');
        }
    };

    const handleGetCurrentUser = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await authApi.getCurrentUser();
            if (result.Success && result.User) {
                setIsLoggedIn(true);
                setCurrentUser(result.User);
            } else {
                setError('No user is currently logged in');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to get current user');
        } finally {
            setLoading(false);
        }
    };

    if (isLoggedIn && currentUser) {
        return (
            <div className="login-container">
                <div>
                    <div className="user-details-card">
                        <h2>Welcome!</h2>
                        <div className="user-info">
                            <div className="info-row">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{currentUser.Name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{currentUser.Email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">User ID:</span>
                                <span className="info-value">{currentUser.Id}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </div>
                    <button 
                        type="button"
                        onClick={handleGetCurrentUser} 
                        className="get-user-button"
                        disabled={loading}
                    >
                        Get User Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div>
                <div className="login-card">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin} noValidate>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPassword(value);
                                    if (passwordError) {
                                        setPasswordError(validatePassword(value));
                                    }
                                }}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                            />
                        </div>
                        <ul style={{ listStyle: 'disc', paddingInlineStart: 18, margin: '6px 0 0', fontSize: 12, color: '#666' }}>
                            {(() => {
                                const checks = getPasswordChecks(password);
                                const items = [
                                    { ok: checks.lower, text: 'אות קטנה (a-z)' },
                                    { ok: checks.upper, text: 'אות גדולה (A-Z)' },
                                    { ok: checks.digit, text: 'מספר (0-9)' },
                                    { ok: checks.special, text: 'תו מיוחד (!@#$ וכדומה)' },
                                    { ok: checks.length, text: 'לפחות 8 תווים' }
                                ];

                                return items.map((item, index) => (
                                    <li key={index} style={{ color: item.ok ? '#1b7f2a' : '#666' }}>
                                        {item.ok ? '✓' : '•'} {item.text}
                                    </li>
                                ));
                            })()}
                        </ul>
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        {error && <div className="error-message">{error}</div>}
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
                <button 
                    type="button"
                    onClick={handleGetCurrentUser} 
                    className="get-user-button"
                    disabled={loading}
                >
                    Get User Login
                </button>
            </div>
        </div>
    );
};
