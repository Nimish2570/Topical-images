import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../constants';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear the token and redirect to login
        localStorage.removeItem(ACCESS_TOKEN);
        navigate('/login');
    };

    const goToSettings = () => {
        navigate('/settings');
    };

    return (
        <div className="header">
            <button onClick={handleLogout} className='logoutButton'>Log Out</button>
            <button onClick={goToSettings} className='settingsButton'>Settings</button>
        </div>
    );
};

export default Header;
