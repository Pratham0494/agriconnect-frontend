import axios from 'axios';
import { useState } from "react";
import { Link } from 'react-router-dom';

function ChangePass() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("Processing..."); // Show the user the app is "working out"
  setIsError(false);

  try {
    const response = await axios.post(
      "http://localhost:8000/admin-api/password-reset-request/",
      { email: email },
      { withCredentials: true }
    );

    if (response.status === 200) {
      setMessage("Success! If the account exists, a check your email for the reset link.");
      setIsError(false);
      setEmail("");
    }
  } catch (error) {
    console.error("Reset Error:", error.response?.data);
    
    // Better Error Logic:
    if (error.response?.status === 404) {
      setMessage("This email is not registered in our system.");
    } else {
      setMessage(error.response?.data?.email || "Server error. Is Redis running?");
    }
    setIsError(true);
  } finally{
    setLoading(false);
  }
};

  return (
    <div style={styles.pageBg}>
      <div style={styles.card}>
        <div style={styles.logo}>🌱</div>

        <h2 style={styles.header}>FORGOT PASSWORD</h2>
        <p style={styles.subtext}>Enter your registered email to receive a reset link.</p>

        <form onSubmit={handleForgotPassword}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Registered Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p style={{ ...styles.message, color: isError ? '#d32f2f' : '#2fad4f' }}>
            {message}
          </p>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

// Integrated CSS Styles (Combining your friend's design with your theme)
const styles = {
  pageBg: {
    minHeight: '100vh',
    width:'100vw',
    backgroundImage: 'url("https://images.unsplash.com/photo-1533460004989-cef01064af7e?fm=jpg&q=60&w=3000")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    width: '90%',
    maxWidth: '380px',
    padding: '40px 30px',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    borderTop: '5px solid #4caf50',
    textAlign: 'center',
  },
  logo: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  header: {
    color: '#1b5e20',
    fontSize: '22px',
    fontWeight: '800',
    margin: '10px 0',
    letterSpacing: '1px',
  },
  subtext: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '20px',
  },
  inputGroup: {
    textAlign: 'left',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '5px',
    color: '#333',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
  },
  message: {
    marginTop: '15px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '20px',
  },
  link: {
    fontSize: '13px',
    color: '#1e7e34',
    textDecoration: 'none',
    fontWeight: '600',
  }
};

export default ChangePass;