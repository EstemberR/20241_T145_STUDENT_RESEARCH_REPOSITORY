import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Login.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
// Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import auth from './firebaseConfig';
import ReCAPTCHA from "react-google-recaptcha";
import OTPVerification from './OTPVerification'; // Import the OTP modal component

// Generate a unique UID function
export const generateUniqueUid = () => uuidv4(); // Generate UID here if you're not using a separate utils file

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    
    const [userName, setUserName] = useState(null); 
    // Capcha
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
    const [userEmail, setUserEmail] = useState(''); // State to hold the user's email
 
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const [email, setEmail] = useState('');

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
        if (isSubmitting) return;
        
        if (!recaptchaToken) {
            showAlertMessage("Please complete the ReCAPTCHA verification.", "danger");
            return;
        }

        setIsSubmitting(true);

        try {
            // Check for superadmin first
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

            console.log('Attempting admin login with:', credentials.email); // Debug log

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
            console.log('Login response:', data); // Debug log

            if (response.ok) {
                // Store admin data
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.name || 'Administrator');
                localStorage.setItem('userRole', 'admin');

                showAlertMessage('Login successful', 'success');
                navigate('/admin/admin_dashboard');
            } else {
                showAlertMessage(data.message || 'Invalid credentials', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlertMessage('An error occurred during login', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        if (isGoogleLoading) return;
        setIsGoogleLoading(true);
        console.log("Starting Google sign-in process...");

        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Google sign-in successful:", user);

            if (!user.uid) {
                console.error('User UID is null, cannot proceed with sign-in.');
                showAlertMessage('User UID is null, cannot proceed with sign-in.', 'danger');
                return;
            }

            // Check if email is a student email
            const isStudentEmail = user.email.endsWith('@student.buksu.edu.ph');
            const userRole = isStudentEmail ? 'student' : 'instructor';

            const response = await fetch('http://localhost:8000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    uid: user.uid,
                    photoURL: user.photoURL,
                    role: userRole  // Send role to backend
                }),
            });

            const data = await response.json();
            console.log('Parsed response data:', data);

            if (response.ok) {
                if (data.isVerified) {
                    // Store user data in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userName', user.displayName);
                    localStorage.setItem('userRole', userRole); // Use the determined role
                    localStorage.setItem('isGoogleUser', 'true');
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userPhoto', user.photoURL);

                    console.log('User role set to:', userRole); // Debug log

                    // Navigate based on role
                    if (userRole === 'student') {
                        console.log('Navigating to student dashboard');
                        navigate('/student/dashboard');
                    } else {
                        console.log('Navigating to instructor dashboard');
                        navigate('/instructor/instructor_dashboard');
                    }
                } else {
                    // Keep existing OTP verification flow
                    setUserEmail(user.email);
                    setShowOTPVerification(true);
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
         {/* Render OTP Verification Component */}
       {showOTPVerification && (
        <OTPVerification 
            email={userEmail} 
            onClose={() => setShowOTPVerification(false)} 
        />
    )}
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
