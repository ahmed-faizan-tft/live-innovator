import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const Modal = ({ isOpen, onClose, children }) => {

    if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} 
      >
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default Modal;
