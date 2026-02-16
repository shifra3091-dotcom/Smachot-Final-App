import { authApi } from '../services/AuthApi';

import React, { useState } from 'react';
import '../styles/LoginRegister.css';
import type { LoginDto, RegisterDto } from '../services/AuthApi';

interface LoginRegisterProps {
  onLogin?: (loginDto: LoginDto) => void | Promise<void>;
  onRegister?: (registerDto: RegisterDto) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLogin, onRegister, loading, error }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordError, setRegisterPasswordError] = useState('');

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

  // Handlers for form submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(loginPassword);
    setLoginPasswordError(passwordError);
    if (passwordError) {
      return;
    }
    if (onLogin) {
      onLogin({ email: loginEmail, password: loginPassword });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(registerPassword);
    setRegisterPasswordError(passwordError);
    if (passwordError) {
      return;
    }
    if (onRegister) {
      onRegister({ email: registerEmail, password: registerPassword, name: registerUsername });
    }
  };

  return (
    <div className="login-register-container">
      <h2 className="login-title">כניסה למערכת</h2>
      <div className="login-tabs">
        <button
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
          type="button"
        >
          הרשמה
        </button>
        <button
          className={activeTab === 'login' ? 'active' : ''}
          onClick={() => setActiveTab('login')}
          type="button"
        >
          התחברות
        </button>
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</div>}
      {activeTab === 'login' ? (
        <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
          <label className="login-label" htmlFor="login-email">אימייל</label>
          <div className="login-input-wrapper">
            <input
              id="login-email"
              type="email"
              placeholder="כתוב את כתובת האימייל שלך"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>
          <label className="login-label" htmlFor="login-password">סיסמא</label>
          <div className="login-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="כתוב את כתובת האימייל שלך"
              value={loginPassword}
              onChange={e => {
                const value = e.target.value;
                setLoginPassword(value);
                if (loginPasswordError) {
                  setLoginPasswordError(validatePassword(value));
                }
              }}
              className="login-input"
              disabled={loading}
            />
            <span
              className="login-eye"
              onClick={() => setShowPassword(s => !s)}
              title="הצג/הסתר סיסמא"
              style={{ pointerEvents: loading ? 'none' : undefined }}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <ul style={{ listStyle: 'disc', paddingInlineStart: 18, margin: '6px 0 0', fontSize: 12, color: '#666' }}>
            {(() => {
              const checks = getPasswordChecks(loginPassword);
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
          {loginPasswordError && (
            <div style={{ color: '#b00020', fontSize: 12, marginTop: 4 }}>{loginPasswordError}</div>
          )}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'טוען...' : 'התחברות'}
          </button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleRegisterSubmit} noValidate>
          <label className="login-label" htmlFor="register-username">שם משתמש</label>
          <div className="login-input-wrapper">
            <input
              id="register-username"
              type="text"
              placeholder="כתוב את שם המשתמש שלך"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>
          <label className="login-label" htmlFor="register-phone">טלפון</label>
          <div className="login-input-wrapper">
            <input
              id="register-phone"
              type="tel"
              placeholder="כתוב מס' הטלפון שלך"
              value={registerPhone}
              onChange={e => setRegisterPhone(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>
          <label className="login-label" htmlFor="register-email">אימייל</label>
          <div className="login-input-wrapper">
            <input
              id="register-email"
              type="email"
              placeholder="כתוב את כתובת האימייל שלך"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>
          <label className="login-label" htmlFor="register-password">סיסמא</label>
          <div className="login-input-wrapper">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="כתוב את כתובת האימייל שלך"
              value={registerPassword}
              onChange={e => {
                const value = e.target.value;
                setRegisterPassword(value);
                if (registerPasswordError) {
                  setRegisterPasswordError(validatePassword(value));
                }
              }}
              className="login-input"
              disabled={loading}
            />
            <span
              className="login-eye"
              onClick={() => setShowPassword(s => !s)}
              title="הצג/הסתר סיסמא"
              style={{ pointerEvents: loading ? 'none' : undefined }}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <ul style={{ listStyle: 'disc', paddingInlineStart: 18, margin: '6px 0 0', fontSize: 12, color: '#666' }}>
            {(() => {
              const checks = getPasswordChecks(registerPassword);
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
          {registerPasswordError && (
            <div style={{ color: '#b00020', fontSize: 12, marginTop: 4 }}>{registerPasswordError}</div>
          )}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'טוען...' : 'הרשמה'}
          </button>
        </form>
      )}
      <div className="login-divider">
        <span>או המשך עם</span>
      </div>
       <div className="connect-ways">
            <button type="button" onClick={() => authApi.loginApple()}><img src="/src/assets/Login/apple.png" alt="Apple login" /></button>
            <button type="button" onClick={() => authApi.loginGoogle()}><img src="/src/assets/Login/google.png" alt="Google login" /></button>
             {/* onClick={() => loginByGoogle()}
             onClick={() => loginByApple()} */}
        </div>
    </div>
  );
};

export default LoginRegister;
