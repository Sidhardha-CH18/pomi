import React from "react";
import { Link } from "react-router-dom";

function HomePage({ models, setSelectedModel }) {
  return (
    <div className="home">
      <h1>Furniture AR App</h1>
      <div className="furniture-list">
        {models.map((model, index) => (
          <div
            className="furniture-item"
            key={index}
            onClick={() => setSelectedModel(model)}
          >
            <Link to="/detail">
              <img src={model.image} alt={model.name} />
              <p>{model.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
