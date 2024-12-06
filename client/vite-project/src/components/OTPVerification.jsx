import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/otpVerification.css';

const OTPVerification = ({ email, onClose }) => {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // Changed initial state
    const [isOtpSent, setIsOtpSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Prevent multiple sends
        if (isOtpSent) return;

        const sendOtp = async () => {
            try {
                setStatus('sending');
                setMessage('Sending OTP to your email...');
                
                const response = await fetch('http://localhost:8000/api/auth/send-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();
                
                if (response.ok) {
                    setIsOtpSent(true);
                    setStatus('sent');
                    setMessage('OTP has been sent to your email. Please check your inbox.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Failed to send OTP');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Failed to send OTP. Please try again.');
            }
        };

        sendOtp();

        // Cleanup function
        return () => {
            setIsOtpSent(false);
        };
    }, [email]); // Only depend on email

    const handleVerifyOTP = async () => {
        if (!otp) {
            setMessage('Please enter the OTP');
            return;
        }

        setStatus('verifying');
        setMessage('Verifying your OTP...');

        try {
            setMessage('Verifying OTP...'); // Show verification in progress
            const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            if (response.ok) {
                const data = await response.json();
                setStatus('success');
                setMessage('Verification successful!');
                const photoURL = sessionStorage.getItem('tempUserPhoto');
                const userName = sessionStorage.getItem('tempUserName');
                
                // Store necessary data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', userName);
                localStorage.setItem('userPhoto', photoURL);
                localStorage.setItem('isGoogleUser', 'true');
                localStorage.setItem('isVerified', 'true');
                
                // Immediate navigation without delay
                if (data.redirect) {
                    navigate(data.redirect);
                } else {
                    // Fallback navigation based on role
                    const userRole = localStorage.getItem('userRole');
                    if (userRole === 'student') {
                        navigate('/student/dashboard');
                    } else if (userRole === 'instructor') {
                        navigate('/instructor/instructor_dashboard');
                    }
                }
                onClose(); // Close the OTP modal
            } else {
                setStatus('error');
                setMessage(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to verify OTP. Please try again.');
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup function
            setIsOtpSent(false);
            setOtp('');
            setMessage('');
            setStatus('idle');
        };
    }, []);

    return (
        <div className="otp-verification-container">
            <div className="otp-verification-content">
                <h2>OTP Verification</h2>
                
                {/* Status Message */}
                <div className={`status-message ${status}`}>
                    {message}
                </div>

                <p>Please enter the OTP sent to your email: <strong>{email}</strong></p>
                
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="otp-input"
                    disabled={status === 'verifying' || status === 'success'}
                />
                
                <button 
                    onClick={handleVerifyOTP} 
                    className="otp-button"
                    disabled={status === 'verifying' || status === 'success'}
                >
                    {status === 'verifying' ? 'Verifying...' : 'Verify OTP'}
                </button>

                {status !== 'success' && (
                    <button 
                        onClick={onClose} 
                        className="otp-close-button"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
};

export default OTPVerification;