import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connection, start } from "../signalr/signalrConnection";

function WebSocketDemo() {
  useEffect(() => {
    start();

    // Khi server gửi thông báo
    connection.on("ReceiveMessage", (message) => {
      toast.info(message);
    });

    return () => {
      connection.off("ReceiveMessage");
    };
  }, []);

  const sendMessage = async () => {
    try {
      await fetch("https://localhost:5001/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify("Hello from frontend!"),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>SignalR Toast Demo</h1>
      <button onClick={sendMessage}>Send Notification</button>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default WebSocketDemo;
