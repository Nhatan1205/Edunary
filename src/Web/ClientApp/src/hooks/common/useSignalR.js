import * as signalR from "@microsoft/signalr";
import { useEffect, useRef, useCallback } from "react";
import { tokenService } from "../../utils/tokenService";

// Singleton connection — shared across all hooks that call useSignalR()
let sharedConnection = null;
let connectionPromise = null;

function getConnection() {
  if (!sharedConnection) {
    sharedConnection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/app", {
        accessTokenFactory: () => tokenService.getToken() || "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();
  }
  return sharedConnection;
}

async function ensureConnected() {
  if (!tokenService.getToken()) return null;

  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    if (!connectionPromise) {
      connectionPromise = conn
        .start()
        .then(() => {
          connectionPromise = null;
        })
        .catch((err) => {
          connectionPromise = null;
          sharedConnection = null;
          throw err;
        });
    }
    await connectionPromise;
  }
  return conn;
}

// Call on logout — stops connection and resets singleton
export async function disconnectSignalR() {
  if (sharedConnection) {
    try {
      await sharedConnection.stop();
    } catch {
      // ignore stop errors
    }
    sharedConnection = null;
    connectionPromise = null;
  }
}

export function useSignalR() {
  const cleanups = useRef([]);

  const on = useCallback((eventName, callback) => {
    let cancelled = false;

    ensureConnected().then((conn) => {
      if (cancelled || !conn) return;
      conn.on(eventName, callback);
    });

    const cleanup = () => {
      cancelled = true;
      const conn = getConnection();
      conn.off(eventName, callback);
    };

    cleanups.current.push(cleanup);
    return cleanup;
  }, []);

  // Cleanup all listeners registered by this hook instance on unmount
  useEffect(() => {
    return () => {
      cleanups.current.forEach((fn) => fn());
      cleanups.current = [];
    };
  }, []);

  return { on };
}
