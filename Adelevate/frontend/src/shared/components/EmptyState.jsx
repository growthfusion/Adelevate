import React from "react";
import Button from "./Button";

const EmptyState = ({ icon, title, description, action, className = "" }) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
