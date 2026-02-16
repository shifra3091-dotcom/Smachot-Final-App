import { Routes, Route } from 'react-router-dom';
import { HallsList } from './components/HallsList';
import { Login } from './components/Login';
import { EventGallery } from './components/EventGallery';
import { GuestOptions } from './pages/Guests/GuestOptions';
import { HallFeedback } from './pages/Guests/HallFeedback';
import { GoldenBook } from './pages/Guests/GoldenBook';
import { Image } from './pages/Guests/Image';
import { Video } from './pages/Guests/Video';

import EventOwnerAuth from './pages/EventOwner/EventOwnerAuth';
import HomePage from './pages/EventOwner/HomePage';
import EventDefinition from './pages/EventOwner/EventDefinition';
import EventDetails from './pages/EventOwner/EventDetails';
import AllEvents from './pages/EventOwner/AllEvents';
import HallManagerAuth from './pages/HallManager/HallManagerAuth';
import HallEvents from './pages/HallManager/HallEvents';
import HallEventsSimple from './pages/HallManager/HallEventsSimple';
import MyHalls from './pages/HallManager/MyHalls';
import MyHallsSimple from './pages/HallManager/MyHallsSimple';
import EventFeedbacks from './pages/HallManager/EventFeedbacks';
import CreateHall from './pages/HallManager/CreateHall';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={
                <>
                    <Login />
                    <HallsList />
                </>
            } />
            {/* /event-gallery/:eventId */}
            <Route path="/event-gallery/:eventId" element={<EventGallery />} />
            {/* /image?eventId=... */}
            <Route path="/image" element={<Image />} />
            {/* /video?eventId=... */}
            <Route path="/video" element={<Video />} />
            {/* /guest-options?eventId=...&hallId=... */}
            <Route path="/guest-options" element={<GuestOptions />} />
            {/* /hall-feedback?eventId=...&hallId=... */}
            <Route path="/hall-feedback" element={<HallFeedback />} />
            {/* /golden-book?eventId=... */}
            <Route path="/golden-book" element={<GoldenBook />} />

            <Route path="/eventowner/login" element={<EventOwnerAuth />} />
            <Route path="/hallmanager/login" element={<HallManagerAuth />} />
            <Route path="/eventmanager/login" element={<HallManagerAuth />} />
            <Route path="/eventowner/home" element={<HomePage />} />
            <Route path="/eventowner/event-definition" element={<EventDefinition />} />
            <Route path="/eventowner/all-events" element={<AllEvents />} />
            <Route path="/eventowner/event-details/:eventId" element={<EventDetails />} />
            <Route path="/hallmanager/my-halls" element={<MyHalls />} />
            <Route path="/hallmanager/my-halls-simple" element={<MyHallsSimple />} />
            <Route path="/hallmanager/create-hall" element={<CreateHall />} />
            <Route path="/hallmanager/events/:hallId" element={<HallEvents />} />
            <Route path="/hallmanager/events-simple/:hallId" element={<HallEventsSimple />} />
            <Route path="/hallmanager/event-feedbacks/:eventId" element={<EventFeedbacks />} />
        </Routes>
    );
};