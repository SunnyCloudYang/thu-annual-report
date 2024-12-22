import { React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { InfoHelper } from '@thu-info/lib';
import { HelperContext } from './context/HelperContext';

function App() {
  const helper = new InfoHelper();
  return (
    <HelperContext.Provider value={helper}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </HelperContext.Provider>
  );
}

export default App;
