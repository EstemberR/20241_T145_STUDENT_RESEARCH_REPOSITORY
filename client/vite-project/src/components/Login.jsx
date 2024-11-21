import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Login.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
// Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import auth from './firebaseConfig';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {

    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        rememberMe: true
    });
    const [userName, setUserName] = useState(null); 
    //Capcha
    const recaptchaVerified = useState(false); 
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success' or 'danger'
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const isGoogleUser = localStorage.getItem('isGoogleUser');

        if (token && userRole) {
            if (userRole === 'student') {
                navigate('/student/dashboard');
            } else if (userRole === 'instructor') {
                navigate('/instructor/instructor_dashboard');
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            showAlertMessage("Please complete the ReCAPTCHA verification.", "danger");
           
            return;
        }

        try {
            // Add console logs for debugging
            console.log('Attempting login with:', {
                email: credentials.email,
                isSuperAdmin: credentials.email === 'superadmin@buksu.edu.ph'
            });

            // Check for superadmin
            if (credentials.email === 'superadmin@buksu.edu.ph' && 
                credentials.password === 'BuksuSuperAdmin2024') {
                
                console.log('Superadmin credentials matched');
                
                // Store superadmin data
                const storage = credentials.rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', 'superadmin-token');
                storage.setItem('userName', 'Super Administrator');
                storage.setItem('userRole', 'superadmin');
                
                // Navigate to superadmin dashboard
                navigate('/superadmin/dashboard');
                showAlertMessage('Super Admin login successful', 'success');
                return;
            }

            // Regular login process for other users
            const response = await fetch('http://localhost:8000/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: credentials.email, 
                    password: credentials.password,
                    recaptchaToken: recaptchaToken
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.archived) {
                    showAlertMessage('Your account is archived. Please contact the admin to restore your account.', 'warning');
                    return;
                }

                const storage = credentials.rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', data.token);
                storage.setItem('userName', data.name);
                storage.setItem('userRole', data.role);

                // Handle Google user data if present
                if (data.isGoogleUser) {
                    storage.setItem('isGoogleUser', 'true');
                    storage.setItem('userEmail', data.email);
                    storage.setItem('userPhoto', data.photoURL);
                }

                // Navigate based on role
                if (data.role === 'superadmin') {
                    navigate('/SuperAdmin/dashboard'); // or wherever you want superadmin to go
                    showAlertMessage('Super Admin login successful', 'success');
                }
                if (data.role === 'student') {
                    navigate('/student/dashboard');
                    showAlertMessage('Student login successful', 'success');
                } else if (data.role === 'instructor') {
                    navigate('/instructor/instructor_dashboard');
                    showAlertMessage('Instructor login successful', 'success');
                } else if (data.role === 'admin') {
                    navigate('/admin/admin_dashboard');
                    showAlertMessage('Admin login successful', 'success');
                }
            } else {
                showAlertMessage(data.message || 'Invalid credentials', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlertMessage('An error occurred during login', 'danger');
        } 
    };

    // Firebase Google login function
    const handleGoogle = async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Get the profile picture URL
            const photoURL = user.photoURL;

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
                    uid: user.uid,
                    photoURL: photoURL  // Add this to send to backend
                }),
            });

            const data = await response.json(); 

            if (response.ok) {
                console.log('User authenticated successfully:', data);
                const { token, role, name } = data;

                // Store all necessary data including profile picture
                localStorage.setItem('token', token); 
                localStorage.setItem('userName', name);
                localStorage.setItem('isGoogleUser', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userPhoto', photoURL);  // Store photo URL

                // Check if role is an array
                const userRole = Array.isArray(role) ? role[0] : role;
                localStorage.setItem('userRole', userRole);

                if (userRole === 'student') {
                    navigate('/student/dashboard');
                } else if (userRole === 'instructor') {
                    navigate('/instructor/instructor_dashboard');
                } else {
                    showAlertMessage(`Invalid user role: ${userRole}`, 'danger');
                }
            } else {
                console.error('Authentication failed:', data.error || 'Unknown error');
                showAlertMessage(data.error || 'Authentication failed', 'danger');
            }
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            showAlertMessage('Error during Google sign-in. Please try again.', 'danger');
        }
    };
    

    {/*ReCAPCHA*/}
    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };
    
    // Helper function to show alerts
    const showAlertMessage = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    };
    
    return (
        <div className="login-container">
            {showAlert && (
                <div className={`alert alert-${alertType} alert-dismissible fade show position-absolute top-0 start-50 translate-middle-x mt-3`} 
                     role="alert" 
                     style={{ 
                         maxWidth: '300px', 
                         zIndex: 1000 
                     }}>
                    {alertMessage}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowAlert(false)} 
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    ></button>
                </div>
            )}
            <div className="col-md-6 d-none d-md-block login-image-container login-image">
                <div className="background"></div>
                <div className="overlay-image"></div>
            </div>

            <div className="login-form-container">
                <div className="login-title-container text-center buksu-logo">
                    <h1 className="login-title">Student Research Repository System</h1>
                </div>

                <div className="admin-section text-center">
                        <div className="user-section text-center">
                            <h2 className="login-label">User Login</h2>
                            <div className="d-flex flex-column align-items-center">
                                <button onClick={handleGoogle} className="btn btn-google w-50 mb-2">
                                    <i className="fab fa-google me-2"></i>Login with Google
                                </button>
                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="rememberMe"
                                        checked={credentials.rememberMe}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            rememberMe: e.target.checked
                                        }))}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Keep me logged in
                                    </label>
                                </div>

                            </div>
                        </div>

                        <hr />
                <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-white">
            
                    <h2 className="login-label">Admin Login</h2>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control mb-3"
                            placeholder="Email"
                            value={credentials.email}
                            onChange={(e) => setCredentials(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            required
                        />
                    </div>

                        <div className="form-group">
                            <input
                                type="password"
                                className="form-control mb-3"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={(e) => setCredentials(prev => ({
                                    ...prev,
                                    password: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <ReCAPTCHA
                            className="ReCapcha"
                            sitekey="6LfhrXEqAAAAAGnZSuJmLvDYlaNiBtWojYht08wy"
                            onChange={handleRecaptchaChange}
                        />

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
