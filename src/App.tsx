import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StartupScreen from './components/Startup/StartupScreen';
import EditorLayout from './components/Editor/EditorLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartupScreen />} />
        <Route path="/editor" element={<EditorLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
