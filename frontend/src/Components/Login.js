import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./component-css/login.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
//firebase
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {auth } from '../firebase/firebaseConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', email, password);
  };
  
  //Firebase
  const handleGoogle = async (e) =>{
    const provider = await new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
  }

  
  return (
    <div className="login-container">
      {/* Left Side - Image */}
      <div className="col-md-6 d-none d-md-block login-image">
        <div className="overlay-image"></div> 
      </div>

      {/* Right Side - Form */}
      <div className="col-md-6 login-form-container">
        
        {/* Title */}
        <div className="login-title-container text-center buksu-logo">
          <h1 className="login-title display-5">Student Research Repository System</h1>
        </div>

        {/* Login Form */}
        <div className="login-form">  
          <h2 className="mb-4, login-label">Log in</h2>
          
          <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-white">
            <div className="form-group">
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}

                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}

                required
              />
            </div>

            <button type="submit" className="btn btn-submit w-100 mb-3">
              Submit
            </button>
          </form>

          {/* Additional Options */}
          <div className="text-center mt-3">
            <button onClick={handleGoogle} className="btn btn-google w-100 mb-3">
              <i className="fab fa-google me-2"></i>Login with Google
            </button> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;