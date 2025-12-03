import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />
};

const colors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800"
};

const Notifications = () => {
  const [notifications, setNotifications] = React.useState([]);

  // Mock notification (in real app, this would come from Redux)
  useEffect(() => {
    // Example: Add notification
    // addNotification({ type: 'success', message: 'Lander created successfully!' });
  }, []);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, ...notification }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg shadow-lg border
            min-w-[320px] max-w-md
            animate-slide-in-right
            ${colors[notification.type]}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
          <div className="flex-1">
            {notification.title && <h4 className="font-semibold mb-1">{notification.title}</h4>}
            <p className="text-sm">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
