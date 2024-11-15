import React from "react";
import { Link } from "react-router-dom";

function FurnitureDetail({ model }) {
  if (!model) return <p>Loading...</p>;

  return (
    <div className="detail">
      <img src={model.image} alt={model.name} style={{ width: "100%" }} />
      <h2>{model.name}</h2>
      <Link to="/ar">
        <button>View in AR</button>
      </Link>
    </div>
  );
}

export default FurnitureDetail;