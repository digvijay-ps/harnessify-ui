import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './LoginLink.css';

const LoginLink: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, clearHeaders } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearHeaders();
    setShowLogoutModal(false);
    navigate('/'); // go back to login
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (isAuthenticated) {
    return (
      <>
        <span
          className="login-link"
          onClick={handleLogoutClick}
          style={{ cursor: 'pointer' }}
        >
          Logout
        </span>

        {showLogoutModal && (
          <ConfirmationModal
            message="Are you sure you want to logout?"
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
          />
        )}
      </>
    );
  }

  return (
    <span
      className="login-link"
      onClick={() => navigate('/login')}
      style={{ cursor: 'pointer' }}
    >
      Sign In
    </span>
  );
};

export default LoginLink;
