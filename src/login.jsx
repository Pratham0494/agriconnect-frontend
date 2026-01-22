import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Login(){
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password , setpassword] = useState('');

  const [emailError , setEmailError] = useState('');
  const [passwordError , setPasswordError] = useState('');

  const [focusField , setFocusField] = useState(null);

  const handlesubmit = async (e) =>{
    e.preventDefault();
    
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email.trim() === ''){
      setEmailError("Please fill this field");
      isValid = false;
    }else if(!emailRegex.test(email)){
      setEmailError("Please enter a valid email address");
      isValid = false;
    }else{
      setEmailError('');
    }

    const specialChars = /[!@#$%^&*]/;
    let errorsList = [];
    if(password.trim() === '') {
      errorsList.push("Please fill this field");
      isValid = false;
    } 
    if (password.length < 6 ) {
      errorsList.push("• be at least 6 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errorsList.push("• Must contain at least one uppercase letter");
    }
    if (!specialChars.test(password)) {
      errorsList.push("• Need at least one special characters(!@#$%^&*)");
    }
    if (errorsList.length > 0) {
      isValid = false;
    }

    setPasswordError(errorsList.join('\n'));

    if (isValid){
      setLoading(true);
      try{
        console.log("Attempting to login with :",email);
        const response = await axios.post('http://localhost:8000/admin-api/api/token/', {
          email: email.trim(),
          password: password.trim()
        } , {
          withCredentials : true
        });

        localStorage.setItem('access_token', response.data.access);

        console.log("Login Successful!",response.data);
        // navigate('/admin-dashboard');
        alert("Login Successful! Redirecting to Admin Dashboard...");
      } catch (error) {
        console.error("Login Error :", error.response?.data);

        if(error.response){
          alert("Login failed :" + (error.response.data.detail || "Invalid Credentials"));
        } else{
          alert("Server Error : Please make sure the Django backend is running.")
        }
      } finally{
        setLoading(false);
      }
    }
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    borderColor: focusField === fieldName ? '#4caf50' : '#ccc',
    boxShadow: focusField === fieldName ? '0 0 8px rgba(76,175,80,0.3)' : 'none',
    outline: 'none',
  });

  return(
    <div style={styles.pageBg}> 
      <div style={styles.card}>
        <div style={styles.iconContainer}>🌱</div>
        <h2 style={styles.header}>Admin Login</h2>
        <form onSubmit={handlesubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type='email'
              placeholder='example@gmail.com'
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
              placeholder='******'
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
            {loading ? 'Signing in...' : 'Sign in'}
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

  card:{
    width: '90%',
    maxWidth:'350px',
    backgroundColor:'rgba(255,255,255,0.98)',
    margin: '20px auto',
    padding: '40px 30px',
    border:'1px solid #c8e6c9',
    borderTop:'5px solid #4caf50',
    borderBottom:'6px solid #4caf50',
    borderRadius : '16px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    fontFamily: 'Arial, sans-serif',
  },

  inputGroup:{
    marginBottom: '15px',
    textAlign: 'left',
    display:'flex',
    flexDirection:'column',
  },

  input:{
    width:'100%',
    padding:'12px',
    fontSize:'14px',
    border:'1px solid #ccc',
    borderRadius:'6px',
    boxSizing:'border-box',
    marginTop:'5px',
    transition:'all 0.3s ease',
  },

  button:{
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop:'10px',
    fontSize:'16px',
    fontWeight:'bold',
    transition:'all 0.3s ease',
    boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
  },

  errorText:{
    color:'red',
    fontSize:'12px',
    marginTop:'5px',
    whiteSpace:'pre-line',
    lineHeight:'1.4',
  },

  forgotPasswordContainer:{
    textAlign:'left',
    marginTop:'4px',
    marginBottom:'8px'
  },

  link:{
    fontSize:'12px',
    color:'#1e7e34',
    textDecoration:'none',
    fontWeight:'500',
  },

  header:{
    color:'#1b5e20',
    fontSize:'26px',
    fontWeight:'800',
    margin:'20px 0 30px 0',
    letterSpacing:'1.5px',
    textTransform:'uppercase',
    fontFamily:'"Segoe UI" , Tahoma , sans-serif',
    textShadow:'1px 1px 2px rgba(0,0,0,0.05)',
  },

  iconContainer:{
    fontSize:'50px',
    marginBottom:'5px',
    display:'flex',
    justifyContent:'center',
  }
};

export default Login;