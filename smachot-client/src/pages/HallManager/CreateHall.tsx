import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hallsApi, type CreateHallForm } from '../../services/HallsApi';
import { eventsApi } from '../../services/EventsApi';
import type { EventType } from '../../types/EventType';

const CreateHall: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<CreateHallForm>({
        Name: '',
        OwnerName: '',
        Phone: '',
        Email: '',
        Password: '',
        HallAddress: '',
        HallPhone: '',
        HallImage: null,
        AllowedEventTypeIds: []
    });
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [availableEventTypes, setAvailableEventTypes] = useState<EventType[]>([]);
    const [loadingEventTypes, setLoadingEventTypes] = useState(true);
    const [newEventTypeName, setNewEventTypeName] = useState('');

    useEffect(() => {
        const loadEventTypes = async () => {
            try {
                setLoadingEventTypes(true);
                const types = await eventsApi.getEventTypesWithAlbums();
                setAvailableEventTypes(types);
            } catch (err) {
                console.error('Failed to load event types:', err);
            } finally {
                setLoadingEventTypes(false);
            }
        };
        loadEventTypes();
    }, []);

    const handleChange = (field: keyof CreateHallForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handlePhoneChange = (field: 'Phone' | 'HallPhone', allowStar = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = allowStar
            ? e.target.value.replace(/[^0-9*]/g, '')
            : e.target.value.replace(/\D/g, '');
        setForm((prev) => ({ ...prev, [field]: sanitized }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && file.size > 10 * 1024 * 1024) {
            setError('הקובץ גדול מדי. מקסימום 10MB.');
            return;
        }
        setForm((prev) => ({ ...prev, HallImage: file }));
    };

    const toggleEventType = (eventTypeId: number) => {
        const eventTypeIdStr = eventTypeId.toString();
        setForm((prev) => {
            const currentIds = prev.AllowedEventTypeIds || [];
            const isSelected = currentIds.includes(eventTypeIdStr);
            return {
                ...prev,
                AllowedEventTypeIds: isSelected
                    ? currentIds.filter(id => id !== eventTypeIdStr)
                    : [...currentIds, eventTypeIdStr]
            };
        });
    };

    const addCustomEventType = () => {
        if (!newEventTypeName.trim()) {
            setError('נא להזין שם לסוג האירוע');
            return;
        }
        
        // Check if already exists in selected types
        const currentIds = form.AllowedEventTypeIds || [];
        if (currentIds.includes(newEventTypeName.trim())) {
            setError('סוג אירוע זה כבר נבחר');
            return;
        }

        setForm((prev) => ({
            ...prev,
            AllowedEventTypeIds: [...(prev.AllowedEventTypeIds || []), newEventTypeName.trim()]
        }));
        setNewEventTypeName('');
        setError(null);
    };

    const removeCustomEventType = (typeName: string) => {
        setForm((prev) => ({
            ...prev,
            AllowedEventTypeIds: (prev.AllowedEventTypeIds || []).filter(id => id !== typeName)
        }));
    };

    const normalizePhone = (value: string) => value.replace(/[^0-9]/g, '');
    const isValidPhone = (value: string) => {
        const digits = normalizePhone(value);
        return digits.length >= 9 && digits.length <= 10;
    };

    const validate = () => {
        if (!form.Name.trim()) return 'שם אולם חובה';
        if (!form.OwnerName.trim()) return 'שם בעלים חובה';
        if (!form.Phone.trim()) return 'טלפון בעלים חובה';
        if (!isValidPhone(form.Phone)) return 'טלפון בעלים לא תקין';
        if (!form.Email.trim()) return 'אימייל חובה';
        if (!form.Password.trim()) return 'סיסמה חובה';
        if (!form.HallAddress.trim()) return 'כתובת אולם חובה';
        if (!form.HallPhone.trim()) return 'טלפון אולם חובה';
        if (!isValidPhone(form.HallPhone)) return 'טלפון אולם לא תקין';
        if (!form.HallImage) return 'חובה להעלות קובץ אישור אולם';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('Name', form.Name);
            formData.append('OwnerName', form.OwnerName);
            formData.append('Phone', form.Phone);
            formData.append('Email', form.Email);
            formData.append('Password', form.Password);
            formData.append('HallAddress', form.HallAddress);
            formData.append('HallPhone', form.HallPhone);
            if (form.HallImage) {
                formData.append('HallImage', form.HallImage);
            }
            // Add event types
            if (form.AllowedEventTypeIds && form.AllowedEventTypeIds.length > 0) {
                form.AllowedEventTypeIds.forEach((id) => {
                    formData.append('AllowedEventTypeIds', id);
                });
            }

            const result = await hallsApi.createHallFormData(formData);
            setSuccess(`האולם נוצר בהצלחה (מזהה: ${result?.hallId ?? ''})`);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'שגיאה ביצירת אולם. נסה שוב.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ direction: 'rtl', background: '#0b0b0b', minHeight: '100vh', padding: '24px 16px 40px' }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <h1 style={{ margin: 0, color: '#fff', fontSize: 28, fontWeight: 700, textAlign: 'right' }}>יצירת אולם</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                    {error && (
                        <div style={{ color: '#ffb4b4', background: '#2a0d0d', border: '1px solid #5a1b1b', padding: '10px 12px', borderRadius: 10 }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ color: '#a7f3d0', background: '#0b2a1e', border: '1px solid #134e37', padding: '10px 12px', borderRadius: 10 }}>
                            {success}
                        </div>
                    )}

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>שם מנהל</label>
                    <input
                        type="text"
                        value={form.OwnerName}
                        onChange={handleChange('OwnerName')}
                        placeholder="רחל לוי"
                        autoComplete="name"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>טלפון</label>
                    <input
                        type="tel"
                        value={form.Phone}
                        onChange={handlePhoneChange('Phone')}
                        placeholder="054.596.3698"
                        autoComplete="tel"
                        inputMode="numeric"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>אימייל</label>
                    <input
                        type="email"
                        value={form.Email}
                        onChange={handleChange('Email')}
                        placeholder="@gmail.com"
                        autoComplete="email"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>סיסמא</label>
                    <input
                        type="password"
                        value={form.Password}
                        onChange={handleChange('Password')}
                        placeholder="********"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <div style={{ marginTop: 8, color: '#d6c07a', fontSize: 14, fontWeight: 600 }}>פרטי האולם</div>

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>שם האולם</label>
                    <input
                        type="text"
                        value={form.Name}
                        onChange={handleChange('Name')}
                        placeholder="רחל לוי"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>כתובת האולם</label>
                    <input
                        type="text"
                        value={form.HallAddress}
                        onChange={handleChange('HallAddress')}
                        placeholder="רחל לוי"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>טלפון האולם</label>
                    <input
                        type="tel"
                        value={form.HallPhone}
                        onChange={handlePhoneChange('HallPhone', true)}
                        placeholder="רחל לוי"
                        inputMode="numeric"
                        style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #1f1f1f', background: '#1b1b1b', color: '#fff' }}
                        disabled={loading}
                    />

                    <label style={{ color: '#cfcfcf', fontSize: 12 }}>אישור בעל אולם</label>
                    <div
                        style={{
                            border: '1px dashed #3a3a3a',
                            borderRadius: 10,
                            padding: '16px 12px',
                            background: '#141414',
                            color: '#cfcfcf',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 8 }}>(מקסימום 10MB)</div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1px solid #2a2a2a',
                                background: '#1f1f1f',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            בחר קובץ
                        </button>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#bdbdbd' }}>
                            {form.HallImage ? form.HallImage.name : 'לא נבחר קובץ'}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            required
                        />
                    </div>

                    <div style={{ marginTop: 8, color: '#d6c07a', fontSize: 14, fontWeight: 600 }}>סוגי אירועים מותרים באולם</div>
                    
                    {loadingEventTypes ? (
                        <div style={{ color: '#9a9a9a', fontSize: 14, textAlign: 'center', padding: '12px' }}>
                            טוען סוגי אירועים...
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                            gap: 10,
                            marginTop: 8 
                        }}>
                            {availableEventTypes.map((eventType) => {
                                const isSelected = form.AllowedEventTypeIds?.includes(eventType.EventTypeId.toString()) || false;
                                return (
                                    <button
                                        key={eventType.EventTypeId}
                                        type="button"
                                        onClick={() => toggleEventType(eventType.EventTypeId)}
                                        disabled={loading}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: 10,
                                            border: isSelected ? '2px solid #d0a835' : '1px solid #2a2a2a',
                                            background: isSelected ? '#2a2314' : '#1b1b1b',
                                            color: isSelected ? '#d0a835' : '#cfcfcf',
                                            fontSize: 13,
                                            fontWeight: isSelected ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {eventType.EventTypeNameKey}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    
                    {form.AllowedEventTypeIds && form.AllowedEventTypeIds.length > 0 && (
                        <div style={{ 
                            color: '#9a9a9a', 
                            fontSize: 12, 
                            marginTop: 6,
                            textAlign: 'right'
                        }}>
                            נבחרו {form.AllowedEventTypeIds.length} סוגי אירועים
                        </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <label style={{ color: '#cfcfcf', fontSize: 12, display: 'block', marginBottom: 6 }}>הוסף סוג אירוע חדש</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                value={newEventTypeName}
                                onChange={(e) => setNewEventTypeName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCustomEventType();
                                    }
                                }}
                                placeholder="לדוגמה: חינה, אירוסין"
                                style={{ 
                                    flex: 1,
                                    padding: '10px 12px', 
                                    borderRadius: 10, 
                                    border: '1px solid #1f1f1f', 
                                    background: '#1b1b1b', 
                                    color: '#fff',
                                    fontSize: 13
                                }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={addCustomEventType}
                                disabled={loading || !newEventTypeName.trim()}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: newEventTypeName.trim() ? '#d0a835' : '#3a3a3a',
                                    color: newEventTypeName.trim() ? '#111' : '#6a6a6a',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: newEventTypeName.trim() ? 'pointer' : 'not-allowed',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                + הוסף
                            </button>
                        </div>
                    </div>

                    {/* Display custom event types that don't exist in the system */}
                    {form.AllowedEventTypeIds && form.AllowedEventTypeIds.length > 0 && (
                        <div>
                            {form.AllowedEventTypeIds
                                .filter(id => !availableEventTypes.some(et => et.EventTypeId.toString() === id))
                                .map((customType) => (
                                    <div
                                        key={customType}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '6px 10px',
                                            marginTop: 8,
                                            marginLeft: 6,
                                            borderRadius: 8,
                                            background: '#2a2314',
                                            border: '1px solid #d0a835',
                                            color: '#d0a835',
                                            fontSize: 12
                                        }}
                                    >
                                        <span>{customType}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCustomEventType(customType)}
                                            disabled={loading}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#d0a835',
                                                cursor: 'pointer',
                                                padding: 0,
                                                fontSize: 14,
                                                lineHeight: 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => {}}
                        style={{
                            alignSelf: 'flex-start',
                            marginTop: 4,
                            background: 'transparent',
                            border: 'none',
                            color: '#cfcfcf',
                            fontSize: 12,
                            cursor: 'pointer'
                        }}
                    >
                        + אלבום נוסף
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: 4,
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: 'none',
                            background: '#d0a835',
                            color: '#111',
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'טוען...' : 'הרשמה'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateHall;
