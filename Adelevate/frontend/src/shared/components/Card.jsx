import React from "react";

const Card = ({
  children,
  className = "",
  padding = true,
  hover = false,
  onClick,
  header,
  footer,
  bordered = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm
        ${padding ? "p-6" : ""}
        ${hover ? "hover:shadow-md transition-shadow duration-200 cursor-pointer" : ""}
        ${bordered ? "border border-gray-200" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {header && <div className="mb-4 pb-4 border-b border-gray-200">{header}</div>}
      {children}
      {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card;
