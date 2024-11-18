import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Login.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
// Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import auth from './firebaseConfig';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState(null); 
    //Capcha
    const recaptchaVerified = useState(false); 
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success' or 'danger'
    const [showAlert, setShowAlert] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            showAlertMessage("Please complete the ReCAPTCHA verification.", "danger");
            return;
        }
        console.log('Login attempted with:', email, password);
    
        try {
            const response = await fetch('http://localhost:8000/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
            console.log('User response:', data);
    
            if (response.ok) {
                if (data.archived) {
                    console.log('Account is archived');  // Debugging message
                    showAlertMessage('Your account is archived. Please contact the admin to restore your account.', 'warning');
                    return;
                }
                const { token } = data;
                const userRole = data.role;
                localStorage.setItem('userName', data.name);
                localStorage.setItem('token', token); 
    
                if (userRole === 'student') {
                    navigate('/student/dashboard');
                    console.log(userRole);
                } else if (userRole === 'instructor') {
                    navigate('/instructor/dashboard');
                    console.log(userRole);
                } else if (userRole === 'admin') {
                    navigate('/admin/admin_dashboard');
                } else {
                    showAlertMessage('Unknown user role', 'danger');
                }
            } else {
                console.error('Authentication failed:', data.error || 'Unknown error');
                showAlertMessage(data.error || 'Authentication failed', 'danger');
            }
        } catch (error) {
            console.error('Error during login:', error);
            showAlertMessage('An error occurred during login. Please try again.', 'danger');
        }
    };
    
    // Firebase Google login function
    const handleGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
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
    
            if (response.ok) {
                console.log('User authenticated successfully:', data);
                const { token, role, name } = data;

              
    
                localStorage.setItem('token', token); 
                setUserName(name);
                localStorage.setItem('userName', name);
    
                // Check if role is an array
                const userRole = Array.isArray(role) ? role[0] : role;

                // Navigate based on user role
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

                <div className="user-section text-center">
                    <h2 className="login-label">User Login</h2>
                    <button onClick={handleGoogle} className="btn btn-google w-50 mb-3">
                        <i className="fab fa-google me-2"></i>Login with Google
                    </button>
                </div>

                <hr />

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

                        {/*ReCAPTCHA*/}
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
