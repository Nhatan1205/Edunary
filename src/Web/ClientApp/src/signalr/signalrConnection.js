import * as signalR from "@microsoft/signalr";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl("/NotificationHub")
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export async function start() {
  try {
    await connection.start();
    console.log("SignalR Connected.");
  } catch (err) {
    console.log(err);
    setTimeout(start, 5000);
  }
}
