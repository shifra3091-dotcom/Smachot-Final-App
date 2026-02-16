import './App.css'
import './styles/LoginRegister.css';
import LoginRegister from './components/LoginRegister';
import { BrowserRouter as Router } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { LanguageSelector } from './components/LanguageSelector'
import { AppRoutes } from './router'
import HallManagerMenu from './components/HallManagerMenu'


function App() {
    return (
        <LanguageProvider>
            <Router>
                <div className="App">
                    {/* Preview the new Login/Register UI at the top for now */}
                    {/* <LoginRegister /> */}
                    <LanguageSelector />
                    <HallManagerMenu />
                    <AppRoutes />
                </div>
            </Router>
        </LanguageProvider>
    )
}

export default App
