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

  if (conn.state === signalR.HubConnectionState.Connected) return conn;

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    if (!connectionPromise) {
      connectionPromise = conn
        .start()
        .then(() => { connectionPromise = null; })
        .catch((err) => {
          connectionPromise = null;
          sharedConnection = null;
          throw err;
        });
    }
    await connectionPromise;
    return conn;
  }

  // Connecting or Reconnecting — poll every 100 ms until state settles
  const maxWaitMs = 15_000;
  const startTs = Date.now();
  while (
    (conn.state === signalR.HubConnectionState.Connecting ||
      conn.state === signalR.HubConnectionState.Reconnecting) &&
    Date.now() - startTs < maxWaitMs
  ) {
    await new Promise((r) => setTimeout(r, 100));
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

  const invoke = useCallback(async (methodName, ...args) => {
    const conn = await ensureConnected();
    if (conn && conn.state === signalR.HubConnectionState.Connected) {
      try {
        return await conn.invoke(methodName, ...args);
      } catch (err) {
        console.error(`Error invoking hub method ${methodName}:`, err);
        throw err;
      }
    } else {
      console.warn(`AppHub not connected. Discarding invoke for: ${methodName}`);
    }
  }, []);

  /**
   * Register a callback that fires every time the connection successfully
   * reconnects. Uses a `cancelled` flag to prevent stale handlers from
   * running after the component unmounts.
   */
  const onReconnected = useCallback((callback) => {
    let cancelled = false;

    ensureConnected().then((conn) => {
      if (cancelled || !conn) return;
      conn.onreconnected(() => {
        if (!cancelled) callback();
      });
    });

    const cleanup = () => { cancelled = true; };
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

  return { on, invoke, onReconnected };
}
