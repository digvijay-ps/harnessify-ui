// src/components/Layout/HeaderBar.tsx
import React from 'react';
import './HeaderBar.css';
import SearchBar from '../SearchBar/SearchBar';
import { HiHome } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import psLogo from '../../assets/PS_Logo_RGB.svg';
import LoginLink from '../LoginButton/LoginLink';

interface HeaderBarProps {
  title: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title }) => {
    const navigate = useNavigate();
  return (
    <header className="header-bar">
      <div className="header-left">
        <button className="header-home-icon" onClick={() => navigate('/home')}>
          <HiHome />
        </button>
        <h1 className="header-bar-title">{title}</h1>
      </div>
      <div className='header-right'>
        <div className='ps-logo'><img src={psLogo} alt="PS Logo" /></div>
        <div className="header-bar-search">
          <SearchBar />
        </div>
        <div className='login-link'><LoginLink/></div>
      </div>
    </header>

  );
};

export default HeaderBar;
