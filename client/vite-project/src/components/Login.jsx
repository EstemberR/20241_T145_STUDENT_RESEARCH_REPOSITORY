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
        rememberMe: false
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

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

    // Helper function for navigation with transition
    const navigateWithTransition = (path, message, type) => {
        setIsTransitioning(true);
        showAlertMessage(message, type);
        
        setTimeout(() => {
            navigate(path);
        }, 500); // Match this with your CSS animation duration
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent multiple submissions
        
        if (!recaptchaToken) {
            showAlertMessage("Please complete the ReCAPTCHA verification.", "danger");
            return;
        }

        setIsSubmitting(true); // Start loading

        try {
            // Check for superadmin - Always use localStorage for admin
            if (credentials.email === 'superadmin@buksu.edu.ph' && 
                credentials.password === 'BuksuSuperAdmin2024') {
                
                console.log('Superadmin credentials matched');
                
                // Always use localStorage for admin, regardless of remember me
                localStorage.setItem('token', 'superadmin-token');
                localStorage.setItem('userName', 'Super Administrator');
                localStorage.setItem('userRole', 'superadmin');
                
                navigateWithTransition('/superadmin/dashboard', 'Super Admin login successful', 'success');
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

                // Always use localStorage for admin users
                if (data.role === 'admin' || data.role === 'superadmin') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userName', data.name);
                    localStorage.setItem('userRole', data.role);
                } else {
                    // For non-admin users, use the remember me preference
                    const storage = credentials.rememberMe ? localStorage : sessionStorage;
                    storage.setItem('token', data.token);
                    storage.setItem('userName', data.name);
                    storage.setItem('userRole', data.role);
                }

                // Navigate based on role
                if (data.role === 'superadmin') {
                    navigateWithTransition('/SuperAdmin/dashboard', 'Super Admin login successful', 'success');
                } else if (data.role === 'admin') {
                    navigateWithTransition('/admin/admin_dashboard', 'Admin login successful', 'success');
                } else if (data.role === 'student') {
                    navigateWithTransition('/student/dashboard', 'Student login successful', 'success');
                } else if (data.role === 'instructor') {
                    navigateWithTransition('/instructor/instructor_dashboard', 'Instructor login successful', 'success');
                }
            } else {
                showAlertMessage(data.message || 'Invalid credentials', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlertMessage('An error occurred during login', 'danger');
        } finally {
            setIsSubmitting(false); // End loading regardless of outcome
        }
    };

    // Firebase Google login function
    const handleGoogle = async () => {
        if (isGoogleLoading) return; // Prevent multiple clicks
        setIsGoogleLoading(true);

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
                showAlertMessage(data.error || 'Your account is archived. Please contact the Admin to restore your account.', 'danger');
            }
        } catch (error) {
            showAlertMessage('Error during Google sign-in. Please try again.', 'danger');
        } finally {
            setIsGoogleLoading(false);
        }
    };
    

    {/*ReCAPCHA*/}
    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };
    
    // Updated showAlertMessage function
    const showAlertMessage = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000); // Hide after 5 seconds
    };
    
    return (
        <div className={`login-container ${isTransitioning ? 'fade-out' : ''}`}>
            {/* Updated Alert Component */}
            {showAlert && (
                <div 
                    className={`alert alert-${alertType} alert-dismissible fade show position-fixed`}
                    role="alert"
                    style={{
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1050,
                        minWidth: '300px',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {alertType === 'success' && <i className="fas fa-check-circle me-2"></i>}
                    {alertType === 'danger' && <i className="fas fa-exclamation-circle me-2"></i>}
                    {alertType === 'warning' && <i className="fas fa-exclamation-triangle me-2"></i>}
                    {alertMessage}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowAlert(false)}
                        aria-label="Close"
                    ></button>
                </div>
            )}
            <div className="login-image">
                <div className="background"></div>
                <div className="content-overlay">
                    <div className="overlay-image"></div>
                    <div className="welcome-text">
                        <h2>Welcome to</h2>
                        <h1>BukSU Research Repository</h1>
                        <p>Access and manage research papers with ease</p>
                    </div>
                </div>
            </div>

            <div className="login-form-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Sign In</h2>
                        <p>Please login to continue</p>
                    </div>

                    <div className="login-options">
                        <button 
                            onClick={handleGoogle} 
                            className="btn btn-google" 
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <i className="fab fa-google"></i>
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>

                        <div className="form-check mb-3 mt-2">
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
                                Remember me
                            </label>
                        </div>

                        <div className="divider">
                            <span>or sign in as admin</span>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-login-form">
                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="emailInput"
                                    placeholder="Email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials(prev => ({
                                        ...prev,
                                        email: e.target.value
                                    }))}
                                    required
                                />
                                <label htmlFor="emailInput">Email address</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    id="passwordInput"
                                    placeholder="Password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials(prev => ({
                                        ...prev,
                                        password: e.target.value
                                    }))}
                                    required
                                />
                                <label htmlFor="passwordInput">Password</label>
                            </div>

                            <div className="recaptcha-container">
                                <ReCAPTCHA
                                    className="g-recaptcha"
                                    sitekey="6LfhrXEqAAAAAGnZSuJmLvDYlaNiBtWojYht08wy"
                                    onChange={handleRecaptchaChange}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-submit" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
