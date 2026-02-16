import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { eventsApi } from '../../services/EventsApi';
import { getAlbumsForEvent } from '../../services/AlbumsApi';
import { hallsApi } from '../../services/HallsApi';
import type { EventType } from '../../types/EventType';
import type { Hall } from '../../types/Hall';
import type { ReadyAlbum } from '../../types/ReadyAlbum';
import '../../styles/EventDefinition.css';

const EventDefinition: React.FC = () => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('eventId');
    const isEditMode = !!eventId;
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
    const [albums, setAlbums] = useState<ReadyAlbum[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [showAddAlbum, setShowAddAlbum] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState('');
    // Remove Family/Times tabs
    const [customAlbumMode, setCustomAlbumMode] = useState(false);
    // Add album tab state ("Family" or "Times")
    const [addAlbumTab, setAddAlbumTab] = useState<'Family' | 'Times'>('Family');
    const [formData, setFormData] = useState({
        eventName: '',
        eventType: '',
        hallId: '',
        startDate: '',
        endDate: '',
        eventImage: null as File | null
    });
    const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

    // ניקוי ה-preview מהזיכרון כאשר הקומפוננטה מתפרקת או התמונה משתנה
    useEffect(() => {
        return () => {
            if (typeof eventImagePreview === 'string') {
                URL.revokeObjectURL(eventImagePreview);
            }
        };
    }, [eventImagePreview]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Initial division: show tabs if there are both Family and Times albums at mount or after event type change
    const [activeTab, setActiveTab] = useState<'Family' | 'Times'>('Family');
    const [showTabs, setShowTabs] = useState(false);
    useEffect(() => {
        // Show tabs if the event type has any Family or Times albums defined
        // But not in edit mode - in edit mode show all albums without tabs
        if (isEditMode) {
            setShowTabs(false);
            return;
        }
        
        let hasFamily = false, hasTimes = false;
        if (selectedEventType && Array.isArray(selectedEventType.ReadyAlbums)) {
            hasFamily = selectedEventType.ReadyAlbums.some(a => a.Family);
            hasTimes = selectedEventType.ReadyAlbums.some(a => a.Times);
        } else {
            hasFamily = albums.some(a => a.Family);
            hasTimes = albums.some(a => a.Times);
        }
        setShowTabs(hasFamily || hasTimes);
        // On first load, set the active tab to the one with albums, or default to Family
        if (albums.length > 0) {
            if (albums.some(a => a.Family) && !albums.some(a => a.Times)) setActiveTab('Family');
            else if (!albums.some(a => a.Family) && albums.some(a => a.Times)) setActiveTab('Times');
            // If both, keep current
        } else if (hasFamily && !hasTimes) {
            setActiveTab('Family');
        } else if (!hasFamily && hasTimes) {
            setActiveTab('Times');
        } else {
            setActiveTab('Family');
        }
    }, [albums, selectedEventType, isEditMode]);
    // אלבום בשם 'כללי' תמיד ראשון
    const filteredAlbumsRaw = showTabs
        ? albums.filter(a => (activeTab === 'Family' ? a.Family : a.Times))
        : albums;
    const filteredAlbums = [
        ...filteredAlbumsRaw.filter(a => a.AlbumName === 'כללי'),
        ...filteredAlbumsRaw.filter(a => a.AlbumName !== 'כללי')
    ];
    // Show available albums for the current tab or globally if no division
    const getAvailableAlbums = (excludeName?: string) => {
        if (!selectedEventType || !Array.isArray(selectedEventType.ReadyAlbums)) return [];
        let usedAlbums;
        if (showTabs) {
            // Only exclude names already present in the current tab
            usedAlbums = albums.filter(a => addAlbumTab === 'Family' ? a.Family : a.Times);
        } else {
            // Exclude names already present in any album
            usedAlbums = albums;
        }
        return selectedEventType.ReadyAlbums.filter(a =>
            a.AlbumName === excludeName || !usedAlbums.some(al => al.AlbumName === a.AlbumName)
        );
    };
    // Get user ID from Redux
    const userId = useAppSelector(state => state.user.user?.Id);

    // Handler for Create/Update Event
    const handleCreateEvent = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            if (!userId) {
                setError('משתמש לא מזוהה. אנא התחבר מחדש.');
                setLoading(false);
                return;
            }
            if (!formData.eventName || !formData.startDate || !formData.hallId) {
                setError('נא למלא את כל השדות הנדרשים.');
                setLoading(false);
                return;
            }
            const dto = {
                eventName: formData.eventName,
                eventDate: formData.startDate,
                backgroundImageUrl: undefined, // נטען מהשרת אחרי העלאת התמונה
                hallId: parseInt(formData.hallId),
                eventTypeId: selectedEventType?.EventTypeId
            };
            // Only send album names from the current tab if tabs are shown, otherwise all
            let albumsNames: string[];
            if (showTabs) {
                albumsNames = albums
                    .filter(a => (activeTab === 'Family' ? a.Family : a.Times))
                    .map(a => a.AlbumName);
            } else {
                albumsNames = albums.map(a => a.AlbumName);
            }
            
            if (isEditMode) {
                // Update existing event
                await eventsApi.updateEventWithAlbums(
                    Number(eventId),
                    dto,
                    albumsNames,
                    formData.eventImage || undefined
                );
                setSuccess('האירוע עודכן בהצלחה!');
            } else {
                // Create new event
                await eventsApi.createEventWithAlbums(
                    userId,
                    dto,
                    albumsNames,
                    formData.eventImage || undefined
                );
                setSuccess('האירוע נוצר בהצלחה!');
            }
        } catch (e: any) {
            setError(e?.message || `שגיאה ב${isEditMode ? 'עדכון' : 'יצירת'} האירוע`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventTypesData, hallsData] = await Promise.all([
                    eventsApi.getEventTypesWithAlbums(),
                    hallsApi.getHalls()
                ]);
                setEventTypes(eventTypesData);
                setHalls(hallsData);
                
                if (isEditMode && eventId) {
                    // Load existing event data
                    const eventData = await eventsApi.getEvents(Number(eventId));
                    if (eventData) {
                        setFormData({
                            eventName: eventData.EventName,
                            eventType: eventData.EventTypeId?.toString() || '',
                            hallId: eventData.HallId?.toString() || '',
                            startDate: eventData.EventStartDate ? eventData.EventStartDate.split('T')[0] : '',
                            endDate: eventData.EventEndDate ? eventData.EventEndDate.split('T')[0] : '',
                            eventImage: null
                        });
                        
                        if (eventData.BackgroundImageUrl) {
                            setEventImagePreview("https://localhost:7168/"+eventData.BackgroundImageUrl);
                        }
                        
                        // Set selected event type
                        const eventType = eventTypesData.find(et => et.EventTypeId === eventData.EventTypeId);
                        if (eventType) {
                            setSelectedEventType(eventType);
                        }
                        
                        // Load existing event albums
                        const eventAlbums = await getAlbumsForEvent(Number(eventId));
                        const albumsData = eventAlbums.map((album:any) => ({
                            ReadyAlbumId: album.AlbumId,
                            AlbumName: album.Name,
                            Family: false,
                            Times: false,
                            IsDefault: false,
                            EventTypeId: eventData.EventTypeId
                        }));
                        setAlbums(albumsData);
                    }
                } else {
                    // Auto-select first event type and its albums for new event
                    if (eventTypesData.length > 0) {
                        const firstType = eventTypesData[0];
                        setSelectedEventType(firstType);
                        if (firstType.ReadyAlbums) {
                            const initialAlbums = firstType.ReadyAlbums.filter(a => a.IsDefault).slice(0, 6).map(a => ({ ...a }));
                            setAlbums(initialAlbums);
                        } else {
                            setAlbums([]);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [isEditMode, eventId]);

    const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selected = eventTypes.find(et => et.EventTypeId === selectedId) || null;
        setSelectedEventType(selected);
        setFormData(prev => ({ ...prev, eventType: e.target.value }));
        
        // In edit mode, keep existing albums and don't replace them
        if (!isEditMode) {
            if (selected && selected.ReadyAlbums) {
                // Show only IsDefault albums by default, up to 6
                // Keep the Family/Times assignment as in ReadyAlbums, only on initial load
                const initialAlbums = selected.ReadyAlbums.filter(a => a.IsDefault).slice(0, 6).map(a => ({ ...a }));
                setAlbums(initialAlbums);
            } else {
                setAlbums([]);
            }
            // Reset tab to Family on event type change
            setActiveTab('Family');
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, eventImage: file }));
        if (eventImagePreview) {
            URL.revokeObjectURL(eventImagePreview);
        }
        if (file) {
            setEventImagePreview(URL.createObjectURL(file));
        } else {
            setEventImagePreview(null);
        }
    };

    const handleAddAlbum = () => {
        setShowAddAlbum(true);
        setAddAlbumTab(activeTab); // Use the current tab as the target for the new album
        setCustomAlbumMode(false);
        setNewAlbumName('');
    };

    const handleConfirmAddAlbum = () => {
        if (newAlbumName && selectedEventType) {
            // In edit mode, don't limit by tab - just check total count
            if (isEditMode) {
                if (albums.length >= 6) return;
                const readyAlbum = selectedEventType.ReadyAlbums?.find(a => a.AlbumName === newAlbumName);
                const newAlbum: ReadyAlbum = {
                    ReadyAlbumId: Date.now(),
                    AlbumName: newAlbumName,
                    Family: false,
                    Times: false,
                    IsDefault: readyAlbum?.IsDefault ?? false,
                    EventTypeId: selectedEventType.EventTypeId
                };
                setAlbums([...albums, newAlbum]);
            } else {
                // Count albums for the current tab only
                const tabCount = albums.filter(a => (addAlbumTab === 'Family' ? a.Family : a.Times)).length;
                if (tabCount >= 6) return;
                // Always add to the current tab, regardless of the original ReadyAlbum's Family/Times
                const readyAlbum = selectedEventType.ReadyAlbums?.find(a => a.AlbumName === newAlbumName);
                const newAlbum: ReadyAlbum = {
                    ReadyAlbumId: Date.now(),
                    AlbumName: newAlbumName,
                    Family: addAlbumTab === 'Family',
                    Times: addAlbumTab === 'Times',
                    IsDefault: readyAlbum?.IsDefault ?? false,
                    EventTypeId: selectedEventType.EventTypeId
                };
                setAlbums([...albums, newAlbum]);
            }
            setShowAddAlbum(false);
            setNewAlbumName('');
            setCustomAlbumMode(false);
        }
    };

    const handleCancelAddAlbum = () => {
        setShowAddAlbum(false);
        setNewAlbumName('');
    };

    const handleDeleteAlbum = (index: number) => {
        setAlbums(albums.filter((_, i) => i !== index));
    };

const handleEditAlbum = (index: number) => {
    setEditingIndex(index);
    setShowAddAlbum(false);
    setCustomAlbumMode(false);
    setNewAlbumName(albums[index].AlbumName);
};

const handleSaveEdit = () => {
    if (editingIndex !== null && newAlbumName) {
        const updatedAlbums = [...albums];
        updatedAlbums[editingIndex].AlbumName = newAlbumName;
        setAlbums(updatedAlbums);
        setEditingIndex(null);
        setNewAlbumName('');
        setCustomAlbumMode(false);
    }
};

const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewAlbumName('');
    setCustomAlbumMode(false);
};



    return (
        <div className="event-definition-container">
            <h2 className="event-definition-title">{isEditMode ? 'עריכת אירוע' : 'שאלון הגדרות'}</h2>
            
            <label className="form-label">פרטי אירוע</label>
            
            <div className="form-group">
                <label className="form-label">סוג אירוע</label>
                <select 
                    value={selectedEventType?.EventTypeId || ''} 
                    onChange={handleEventTypeChange}
                    className="form-select"
                >
                    {eventTypes.map(eventType => (
                        <option key={eventType.EventTypeId} value={eventType.EventTypeId}>
                            {eventType.EventTypeNameKey}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">שם האירוע</label>
                <input 
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    placeholder="חתונה ישראל & שירה"
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label className="form-label">שם האולם</label>
                <select 
                    name="hallId"
                    value={formData.hallId}
                    onChange={handleSelectChange}
                    className="form-select"
                >
                    <option value="">בחר אולם</option>
                    {halls.map(hall => (
                        <option key={hall.HallId} value={hall.HallId}>
                            {hall.Name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="date-row">
                <div className="date-column">
                    <label className="form-label">תאריך התחלת האירוע</label>
                    <input 
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>
                <div className="date-column">
                    <label className="form-label">תאריך סיום האירוע</label>
                    <input 
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="image-upload-section">
                <div className="image-upload-section">
                    <label className="form-label">תמונת רקע</label>
                    <label className="image-upload-area" htmlFor="imageUpload" style={{ cursor: 'pointer', display: 'block', position: 'relative', minHeight: 180 }}>
                        {eventImagePreview ? (
                            <img
                                src={eventImagePreview}
                                alt="תצוגה מקדימה"
                                style={{
                                    width: '100%',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: '1px solid #ccc',
                                    display: 'block',
                                    background: '#f8f8f8'
                                }}
                            />
                        ) : (
                            <>
                                <div className="image-upload-icon">📷</div>
                                <div className="image-upload-text">בחר תמונה קיימת (מקסימום 10MB)</div>
                                <span className="file-button" style={{ margin: '12px auto', display: 'inline-block', background: '#1976d2', color: '#fff', padding: '8px 24px', borderRadius: 6 }}>בחר קובץ</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="file-input"
                            id="imageUpload"
                            style={{ display: 'none' }}
                        />
                        {eventImagePreview && (
                            <span style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                background: 'rgba(255,255,255,0.7)',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                cursor: 'pointer',
                                border: '1px solid #ccc'
                            }} title="החלף תמונה">
                                🔄
                            </span>
                        )}
                    </label>
                </div>


            <div className="albums-section">
                <h3 className="albums-title">אלבומים</h3>
                                {showTabs && (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
            className={activeTab === 'Family' ? 'tab-active' : 'tab-inactive'}
            style={{
                background: activeTab === 'Family' ? '#fff' : '#f5f5f5',
                border: activeTab === 'Family' ? '2px solid #1976d2' : '1px solid #ccc',
                color: activeTab === 'Family' ? '#1976d2' : '#222',
                fontWeight: activeTab === 'Family' ? 700 : 400,
                borderRadius: '8px 0 0 8px',
                padding: '8px 24px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
            }}
            onClick={() => setActiveTab('Family')}
        >
            משפחה
        </button>
        <button
            className={activeTab === 'Times' ? 'tab-active' : 'tab-inactive'}
            style={{
                background: activeTab === 'Times' ? '#fff' : '#f5f5f5',
                border: activeTab === 'Times' ? '2px solid #1976d2' : '1px solid #ccc',
                color: activeTab === 'Times' ? '#1976d2' : '#222',
                fontWeight: activeTab === 'Times' ? 700 : 400,
                borderRadius: '0 8px 8px 0',
                padding: '8px 24px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
            }}
            onClick={() => setActiveTab('Times')}
        >
            זמנים
        </button>
    </div>
)}
                {filteredAlbums.length > 0 ? (
                    filteredAlbums.map((album, index) => (
                        <div key={album.ReadyAlbumId} className="album-item">
                            <div className="album-actions">
                                <button
                                    className="action-button"
                                    onClick={() => handleDeleteAlbum(index)}
                                    disabled={album.AlbumName === "כללי"}
                                    style={album.AlbumName === "כללי" ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    🗑️
                                </button>
                                <button
                                    className="action-button"
                                    onClick={() => handleEditAlbum(index)}
                                    disabled={album.AlbumName === "כללי"}
                                    style={album.AlbumName === "כללי" ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    ✏️
                                </button>
                            </div>
                            <div className="album-info">
                                <div className="album-name">אלבום {index + 1}</div>
                                {editingIndex === index ? (
                                    <div className="album-edit">
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="album-edit-input"
                                        />
                                        <button onClick={handleSaveEdit} className="save-button">✓</button>
                                        <button onClick={handleCancelEdit} className="cancel-button">✗</button>
                                    </div>
                                ) : (
                                    <div className="album-description">{album.AlbumName}</div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-albums-message">
                        {selectedEventType ? 'אין אלבומים זמינים לסוג אירוע זה' : 'בחר סוג אירוע כדי לראות אלבומים'}
                    </div>
                )}
                                {/* Only allow adding if less than 6 albums in the current tab */}
                                {(() => {
                                    const tabCount = albums.filter(a => (showTabs ? (activeTab === 'Family' ? a.Family : a.Times) : true)).length;
                                    return tabCount < 6 && !showAddAlbum;
                                })() && (
                                    <button className="add-album-button" onClick={handleAddAlbum}>
                                        + אלבום חדש
                                    </button>
                                )}
                             {(showAddAlbum || editingIndex !== null) && selectedEventType && (
    <div
        className="add-album-popup-modal"
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.08)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <div
            className="add-album-popup"
            style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 10,
                minWidth: 320,
                maxWidth: 400,
                padding: 24,
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                position: 'relative',
                margin: 16,
            }}
        >
            {/* Close button */}
            <button
                onClick={editingIndex !== null ? handleCancelEdit : handleCancelAddAlbum}
                style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                }}
                aria-label="סגור"
            >
                ×
            </button>
            {/* Title */}
            <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 18, marginBottom: 18 }}>
                אלבום חדש
            </div>
            {/* Album name label */}
            <div style={{ textAlign: 'right', fontWeight: 500, fontSize: 14, marginBottom: 8 }}>
                {customAlbumMode ? 'שם מותאם אישית' : 'שם האלבום'}
            </div>
            {!customAlbumMode ? (
                <>
                    {/* Album name select */}
                    <select
                        value={newAlbumName}
                        onChange={e => {
                            if (e.target.value === '__custom__') {
                                setCustomAlbumMode(true);
                                setNewAlbumName('');
                            } else {
                                setNewAlbumName(e.target.value);
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #bbb',
                            fontSize: 15,
                            marginBottom: 18,
                            background: '#fafafa',
                            direction: 'rtl',
                            appearance: 'none',
                        }}
                    >
                        <option value="">בחר שם אלבום</option>
                        {getAvailableAlbums(editingIndex !== null ? albums[editingIndex].AlbumName : undefined).map(a => (
                            <option key={a.AlbumName} value={a.AlbumName}>{a.AlbumName}</option>
                        ))}
                        <option value="__custom__">שם מותאם אישי</option>
                    </select>
                </>
            ) : (
                <input
                    type="text"
                    placeholder="כתוב את שם האלבום"
                    value={newAlbumName}
                    onChange={e => setNewAlbumName(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: '1px solid #bbb',
                        fontSize: 15,
                        marginBottom: 18,
                        background: '#fafafa',
                        direction: 'rtl',
                    }}
                />
            )}
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
                <button
                    onClick={editingIndex !== null ? handleSaveEdit : handleConfirmAddAlbum}
                    disabled={!newAlbumName}
                    style={{
                        flex: 1,
                        background: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '10px 0',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: !newAlbumName ? 'not-allowed' : 'pointer',
                    }}
                >
                    אישור
                </button>
                <button
                    onClick={editingIndex !== null ? handleCancelEdit : handleCancelAddAlbum}
                    style={{
                        flex: 1,
                        background: '#fff',
                        color: '#000',
                        border: '1px solid #bbb',
                        borderRadius: 6,
                        padding: '10px 0',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                    }}
                >
                    מחק
                </button>
            </div>
        </div>
    </div>
)}
            </div>
            {/* Create Event Button and status */}
            <div style={{ marginTop: 24 }}>
                <button className="create-event-button" onClick={handleCreateEvent} disabled={loading}>
                    {loading ? (isEditMode ? 'מעדכן אירוע...' : 'יוצר אירוע...') : (isEditMode ? 'עדכן אירוע' : 'צור אירוע')}
                </button>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </div>
        </div>
        </div>
    );
};
export default EventDefinition;