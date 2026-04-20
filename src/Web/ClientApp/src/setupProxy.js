const { createProxyMiddleware } = require("http-proxy-middleware");
const { env } = require("process");

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(";")[0]
    : "https://localhost:5001";

const context = ["/api", "/Identity", "/weatherforecast", "/WeatherForecast", "/hls"];

const onError = (err, req, resp, target) => {
  console.error(`${err.message}`);
};

module.exports = function (app) {
  const appProxy = createProxyMiddleware(context, {
    proxyTimeout: 300000,
    secure: false,
    timeout: 300000,
    target: target,
    // Handle errors to prevent the proxy middleware from crashing when
    // the ASP NET Core webserver is unavailable
    onError: onError,
    secure: false,
    // Uncomment this line to add support for proxying websockets
    // ws: true,
    headers: {
      Connection: "Keep-Alive",
    },
  });
  app.use(appProxy);
  const notificationProxy = createProxyMiddleware("/NotificationHub", {
    target,
    secure: false,
    changeOrigin: true,
    ws: true, //add support for proxying websockets
    onError,
  });
  app.use(notificationProxy);
};
