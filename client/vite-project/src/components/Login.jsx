import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Login.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
// Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import auth from './firebaseConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempted with:', email, password);

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('User response:', data); 

            if (response.ok) {
                console.log('User authenticated successfully:', data);
                const userRole = data.role;

                if (userRole === 'student') {
                    navigate('/student/dashboard');
                } else if (userRole === 'instructor') {
                    navigate('/instructor/dashboard');
                } else {
                    alert('Unknown user role'); 
                }
            } else {
                console.error('Authentication failed:', data.error || 'Unknown error');
                alert(data.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again.'); 
        }
    };

    // Firebase Google login function
    const handleGoogle = async () => {
      const provider = new GoogleAuthProvider();
      try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user; // Get user from result
  
          if (!user.uid) {
              throw new Error('User UID is null');
          }
  
          const response = await fetch('http://localhost:8000/api/auth/google', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                  name: user.displayName,
                  email: user.email,
                  uid: user.uid 
              }),
          });
  

            const data = await response.json();
            console.log('User response:', data);

            if (response.ok) {
                console.log('User authenticated successfully:', data);
                const userRole = data.role;

                if (userRole === 'student') {
                    navigate('/student/dashboard');
                } else if (userRole === 'instructor') {
                    navigate('/instructor/dashboard');
                } else {
                    alert('Unknown user role'); 
                }
            } else {
                console.error('Authentication failed:', data.error || 'Unknown error');
                alert(data.error || 'Authentication failed'); 
            }
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            alert('Error during Google sign-in. Please try again.');
        }
    };

    return (
        <div className="login-container">
            {/* Left Side - Image Container */}
            <div className="col-md-6 d-none d-md-block login-image-container login-image">
                <div className="background"></div>
                <div className="overlay-image"></div>
            </div>

            {/* Right Side - Form */}
            <div className="login-form-container">
                {/* Title */}
                <div className="login-title-container text-center buksu-logo">
                    <h1 className="login-title">Student Research Repository System</h1>
                </div>

                {/* User Login Section */}
                <div className="user-section text-center">
                    <h2 className="login-label">User Login</h2>
                    <button onClick={handleGoogle} className="btn btn-google w-50 mb-3">
                        <i className="fab fa-google me-2"></i>Login with Google
                    </button>
                </div>

                <hr /> {/* Separator */}

                {/* Admin Login Section */}
                <div className="admin-section text-center">
                    <h2 className="login-label">Admin Login</h2>
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

                        <button type="submit" className="btn btn-submit w-50 mb-3">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
