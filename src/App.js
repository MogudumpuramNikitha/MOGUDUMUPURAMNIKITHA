import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './Registration';
import Login from './Login'; // You'll need to create this
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          {/* Add a default redirect if needed */}
          <Route path="/" element={<Registration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;