import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetConfirm() {
  const { uidb64, token } = useParams(); // Grabs the secret keys from the URL
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match!");
        setIsError(true);
        return;
    }

    setLoading(true);
    try {
        const response = await axios.post(`http://localhost:8000/admin-api/password-reset-confirm/`, {
            uidb64: uidb64,   
            token: token,
            password: newPassword.trim(), // 👈 Added .trim() for "dense" validation
        });

        if (response.status === 200) {
            alert("Password reset successful! You can now login.");
            navigate('/login');
        }
    } catch (error) {
        // 👈 Insight: Check if the error is specifically a validation error from Django
        const serverMessage = error.response?.data?.error || "Link expired or invalid.";
        setMessage(serverMessage);
        setIsError(true);
    } finally {
        setLoading(false);
    }
};

  return (
    <div style={styles.pageBg}>
      <div style={styles.card}>
        <div style={styles.logo}>🛡️</div>
        <h2 style={styles.header}>SET NEW PASSWORD</h2>
        <form onSubmit={handleReset}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
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
              placeholder="Repeat new password"
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        {message && <p style={{ ...styles.message, color: isError ? 'red' : 'green' }}>{message}</p>}
      </div>
    </div>
  );
}

// Reusing your consistent "AgriConnect" styles
const styles = {
  pageBg: { minHeight: '100vh', width: '100vw', backgroundImage: 'url("https://images.unsplash.com/photo-1533460004989-cef01064af7e?fm=jpg&q=60&w=3000")', backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  header: { color: '#1b5e20', marginBottom: '20px' },
  inputGroup: { textAlign: 'left', marginBottom: '15px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '5px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  logo: { fontSize: '40px' }
};

export default ResetConfirm;