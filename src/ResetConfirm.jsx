import api from './api/axios.js';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetConfirm() {
  const { uidb64, token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setIsError(false);

    
    if (newPassword !== confirmPassword) {
        setMessage("Verification mismatch: Passwords do not match.");
        setIsError(true);
        return;
    }

    const specialChars = /[!@#$%^&*]/;
    let errorsList = [];

    if (newPassword.length < 8) {
        errorsList.push("• Minimum 8 characters required");
    }
    if (!/[A-Z]/.test(newPassword)) {
        errorsList.push("• At least one uppercase letter required");
    }
    if (!specialChars.test(newPassword)) {
        errorsList.push("• At least one special character required (!@#$%^&*)");
    }

    if (errorsList.length > 0) {
        setMessage(errorsList.join('\n'));
        setIsError(true);
        return;
    }

    setLoading(true);
    try {
        
        const response = await api.post(`admin-api/password-reset-confirm/`, {
            uidb64: uidb64,   
            token: token,
            password: newPassword.trim(),
        });

        if (response.status === 200) {
            setMessage("Security credentials updated successfully. Finalizing configuration...");
            setIsError(false);
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    } catch (error) {
        const serverMessage = error.response?.data?.error || "This recovery link is invalid or has expired.";
        setMessage(serverMessage);
        setIsError(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.card}>
        <h2 style={styles.header}>ACCOUNT RECOVERY</h2>
        <p style={styles.subtext}>Establish a new secure password for administrative access.</p>
        
        <form onSubmit={handleReset} noValidate>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? "SYNCHRONIZING..." : "UPDATE CREDENTIALS"}
          </button>
        </form>

        {message && (
          <div style={{ 
            ...styles.messageBox, 
            backgroundColor: isError ? '#fcf1f1' : '#f1f8f1',
            color: isError ? '#b71c1c' : '#1b5e20',
            border: `1px solid ${isError ? '#e57373' : '#81c784'}`
          }}>
            {message}
          </div>
        )}
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
    justifyContent: 'center' 
  },
  card: { 
    backgroundColor: '#ffffff', 
    padding: '50px 40px', 
    borderRadius: '4px', 
    width: '90%', 
    maxWidth: '420px', 
    textAlign: 'center', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    borderTop: '4px solid #2e7d32'
  },
  header: { 
    color: '#333', 
    marginBottom: '8px', 
    fontWeight: '800', 
    fontSize: '20px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  subtext: {
    fontSize: '13px',
    color: '#777',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  inputGroup: { textAlign: 'left', marginBottom: '20px' },
  label: { 
    display: 'block', 
    fontWeight: '700', 
    marginBottom: '8px', 
    fontSize: '11px',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: { 
    width: '100%', 
    padding: '12px 15px', 
    borderRadius: '2px', 
    border: '1px solid #ddd', 
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#fafafa'
  },
  button: { 
    width: '100%', 
    padding: '15px', 
    backgroundColor: '#2e7d32', 
    color: 'white', 
    border: 'none', 
    borderRadius: '2px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    transition: 'background 0.2s',
    fontSize: '13px',
    letterSpacing: '1px',
    marginTop: '10px'
  },
  messageBox: { 
    marginTop: '25px', 
    padding: '15px',
    fontSize: '12px', 
    fontWeight: '600', 
    lineHeight: '1.6',
    borderRadius: '2px',
    textAlign: 'left',
    whiteSpace: 'pre-line'
  }
};

export default ResetConfirm;