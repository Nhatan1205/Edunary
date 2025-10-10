import { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import queryClient from "../configs/reactQuery";
//step 1: creat Context
const SignalRContext = createContext(null);

//step 2: Create provider
export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  useEffect(() => {
    // Khởi tạo connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("/NotificationHub", {})
      .withAutomaticReconnect()
      // .configureLogging(signalR.LogLevel.Information)

      .build();

    setConnection(newConnection);

    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log("SignalR Connected.");
      } catch (err) {
        // console.error("SignalR Connection Error: ", err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Đăng ký sự kiện chỉ 1 lần
    const receiveHandler = (payload) => {
      // toast.success(`${payload.message}`);
      queryClient.invalidateQueries(["notifications"]);
    };

    newConnection.on("ReceiveMessage", receiveHandler);

    // Cleanup khi unmount
    return () => {
      newConnection.off("ReceiveMessage", receiveHandler);
      newConnection.stop();
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ connection }}>
      {children}
    </SignalRContext.Provider>
  );
};

//step 3: create consumer hoook
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("Error geting SignalRContext");
  }
  return context;
};
