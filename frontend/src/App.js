import Home from  "./Components/Home"
import Login from "./Components/Login"
import {BrowserRouter as Router , Routes, Route, } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/Home" element={<Home/>}/>
      </Routes>
    </Router>
  </div>
  );
}

export default App;
