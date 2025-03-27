import './App.css';
import Auth from './components/Auth';
import PageNotFound from './components/PageNotFound';
import ParticipantAuth from './components/ParticipantAuth';
import Session from './components/Session';
import Whiteboard from './components/Whiteboard';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/session/create" element={<Session />} />
          <Route path="/session/:id" element={<Whiteboard />} />
          <Route path="/:id/join/:code" element={<ParticipantAuth/>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
