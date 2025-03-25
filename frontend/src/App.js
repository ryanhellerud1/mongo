import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import { UserProvider } from './context/UserContext';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="py-3">
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} exact />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
