// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ARView from "./ARView";

function App() {
  const model = {
    name: "Single Model",
    glb: "/models/armchair.glb"
  };

  return (
    <Router>
      <div className="app">
        <h1>AR Furniture Placement</h1>
        <div className="model-info">
          <h2>{model.name}</h2>
          <Link to="/ar">
            <button>View in AR</button>
          </Link>
        </div>
        <Routes>
          <Route path="/ar" element={<ARView model={model} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
