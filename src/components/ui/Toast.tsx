import React from 'react';

interface ToastProps {
  type: 'info' | 'success' | 'error'; // Extend as needed
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  let alertClass = '';

  switch (type) {
    case 'info':
      alertClass = 'alert-info';
      break;
    case 'success':
      alertClass = 'alert-success';
      break;
    case 'error':
      alertClass = 'alert-error';
      break;
  }

  return (
    <div className={`toast toast-start`}>
      <div className={`alert ${alertClass}`}>
        <span>{message}</span>
        <button className="btn btn-sm btn-square" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
