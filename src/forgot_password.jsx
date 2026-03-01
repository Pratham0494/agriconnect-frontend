import api from './api/axios.js';
import React, { useState } from "react";
import { Link } from 'react-router-dom';

function ChangePass() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); 
    setIsError(false);

    try {
      
      const response = await api.post("admin-api/password-reset-request/", { 
        email: email.trim() 
      });

      
      if (response.status === 200) {
        setMessage("Instructional link sent. Please check your inbox if the account exists.");
        setIsError(false);
        setEmail("");
      }
    } catch (error) {
      console.error("Reset Request Error:", error.response?.data);
      
      
      const errorData = error.response?.data;
      if (errorData?.email) {
        setMessage(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
      } else {
        setMessage("Unable to process request. Please verify your email or try again later.");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.card}>
        <div style={styles.logo}>🌱</div>

        <h2 style={styles.header}>Reset Access</h2>
        <p style={styles.subtext}>Enter your registered email to receive recovery instructions.</p>

        <form onSubmit={handleForgotPassword} noValidate>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Registered Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@aggriconnect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Processing..." : "Request Reset Link"}
          </button>
        </form>

        {message && (
          <div style={{ 
            ...styles.messageBox, 
            backgroundColor: isError ? '#ffebee' : '#e8f5e9',
            color: isError ? '#c62828' : '#2e7d32',
            border: `1px solid ${isError ? '#ef9a9a' : '#a5d6a7'}`
          }}>
            {message}
          </div>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            &larr; Return to Sign In
          </Link>
        </div>
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
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '90%',
    maxWidth: '400px',
    padding: '45px 35px',
    borderRadius: '12px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  header: {
    color: '#2e7d32',
    fontSize: '22px',
    fontWeight: '700',
    margin: '10px 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  subtext: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '25px',
    lineHeight: '1.5'
  },
  inputGroup: {
    textAlign: 'left',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    marginBottom: '6px',
    color: '#444',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  messageBox: {
    marginTop: '20px',
    padding: '12px',
    fontSize: '13px',
    borderRadius: '4px',
    fontWeight: '500',
    lineHeight: '1.4'
  },
  footer: {
    marginTop: '25px',
  },
  link: {
    fontSize: '13px',
    color: '#2e7d32',
    textDecoration: 'none',
    fontWeight: '600',
  }
};

export default ChangePass;