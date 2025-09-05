
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [token, setToken] = useState('');
  const { setHeaders } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!token.trim()) return;

    setHeaders({
      Authorization: `Bearer ${token}`,
      'x-client-id': '7b4e7797-1bdf-40a0-908f-4827041f4b99',
      'x-project-id': 'e317e372-b9a8-43c1-bfbb-0bf9e472a49d',
      'x-workspace-id': '8e4e13b7-41bf-4f51-a797-652c6f32d176',
    });

    navigate('/home');
  };

  return (
    <div className="login-container">
  <div className="login-card">
    <div className="login-left">
      <img src="/login1.jpg" alt="Login Illustration" />
    </div>
    <div className="login-right">
      <div className="h1-container">
        <h1>
          <span>Welcome to</span>
          <img src="/text.svg" alt="icon" />
          <span>Harnessify</span>
        </h1>
      </div>
      <p>Sign in to your account</p>
      <input
        type="password"
        placeholder="Enter Bearer Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="login-input"
      />
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  </div>
</div>

  );
};

export default Login;
