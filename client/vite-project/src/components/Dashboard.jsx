const Dashboard = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to the Dashboard!</h1>
      <p>You are successfully logged in.</p>
      <button onClick={() => alert("Implement logout functionality here")}>Logout</button>
    </div>
  );
};

export default Dashboard;