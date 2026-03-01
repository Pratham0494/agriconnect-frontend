import api, { setCookie } from './api/axios.js'; 
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setpassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState(''); 
  const [focusField, setFocusField] = useState(null);

  const handlesubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    setApiError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() === '') {
      setEmailError("REQUIRED FIELD");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("INVALID EMAIL FORMAT");
      isValid = false;
    } else {
      setEmailError('');
    }

    if (password.trim() === '') {
      setPasswordError("REQUIRED FIELD");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("MINIMUM 8 CHARACTERS REQUIRED");
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isValid) {
      setLoading(true);
      try {
        
        
        const response = await api.post('admin-api/api/token/', {
          email: email.trim(),
          password: password.trim()
        });

        const { access, refresh } = response.data;
        setCookie('access_token', access, 1);
        setCookie('refresh_token', refresh, 14);

        navigate('/admin-dashboard');
      } catch (error) {
        console.error("Login Error:", error.response?.data);
        
        setApiError(error.response?.data?.detail || "AUTHENTICATION FAILED. VERIFY CREDENTIALS.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    borderColor: focusField === fieldName ? '#2e7d32' : '#ddd',
    boxShadow: focusField === fieldName ? '0 0 4px rgba(46,125,50,0.1)' : 'none',
  });

  return (
    <div style={styles.pageBg}>
      <div style={styles.card}>
        <h2 style={styles.header}>ADMINISTRATIVE ACCESS</h2>
        <p style={styles.subtext}>Secure portal for system management and operations.</p>
        
        {apiError && <div style={styles.apiErrorBox}>{apiError}</div>}

        <form onSubmit={handlesubmit} noValidate>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type='email'
              autoComplete="email"
              placeholder='admin@aggriconnect.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
              style={getInputStyle('email')}
            />
            <div style={styles.errorText}>{emailError}</div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type='password'
              autoComplete="current-password"
              placeholder='••••••••'
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              style={getInputStyle('password')}
            />
            <div style={styles.forgotPasswordContainer}>
              <Link to='/forgot_password' style={styles.link}>Forgot Password?</Link>
            </div>
            <div style={styles.errorText}>{passwordError}</div>
          </div>

          <button
            type='submit'
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'SYNCHRONIZING...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}


const styles = {
  pageBg: {
    minHeight: '100vh',
    width: '100vw',
    backgroundImage: 'url("https://images.unsplash.com/photo-1533460004989-cef01064af7e?fm=jpg&q=60&w=3000")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    padding: '50px 40px',
    borderRadius: '4px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    borderTop: '4px solid #2e7d32',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    color: '#333',
    fontSize: '20px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  subtext: {
    fontSize: '13px',
    color: '#777',
    marginBottom: '35px',
    lineHeight: '1.4'
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#555',
    marginBottom: '8px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '2px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fafafa'
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: '700',
    marginTop: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '10px',
    fontWeight: '600',
    marginTop: '4px',
    height: '12px', 
  },
  apiErrorBox: {
    backgroundColor: '#fcf1f1',
    color: '#b71c1c',
    padding: '12px',
    borderRadius: '2px',
    fontSize: '12px',
    marginBottom: '25px',
    border: '1px solid #e57373',
    textAlign: 'left',
    fontWeight: '500'
  },
  forgotPasswordContainer: {
    textAlign: 'right',
    marginTop: '4px'
  },
  link: {
    fontSize: '12px',
    color: '#2e7d32',
    textDecoration: 'none',
    fontWeight: '600',
  }
};

export default Login;