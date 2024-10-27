import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempted with:', email, password);
  };

  return (
    <div className="App">
      <div className="App-header">
        <div className="login-container" style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
        }}>
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#282c34' }}>Log in</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  width: '100%',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
                required
              />
              
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  width: '100%',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
                required
              />
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white rounded"
                style={{
                  backgroundColor: '#61dafb',
                  color: 'white',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4fa8d1'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#61dafb'}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;