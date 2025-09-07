import React, { useState, useEffect } from 'react';
import followIfLoginRedirect from './api-authorization/followIfLoginRedirect.js';
import { WeatherForecastsClient } from '../web-api-client.ts';

function FetchData() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    populateWeatherData();
  }, []);

  const renderForecastsTable = (forecasts) => {
    return (
      <table className="table table-striped" aria-labelledby="tableLabel">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
            <tr key={forecast.date}>
              <td>{new Date(forecast.date).toLocaleDateString()}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const populateWeatherData = async () => {
    let client = new WeatherForecastsClient();
    const data = await client.getWeatherForecasts();
    setForecasts(data);
    setLoading(false);
  };

  const populateWeatherDataOld = async () => {
    const response = await fetch('weatherforecast');
    followIfLoginRedirect(response);
    const data = await response.json();
    setForecasts(data);
    setLoading(false);
  };

  const contents = loading
    ? <p><em>Loading...</em></p>
    : renderForecastsTable(forecasts);

  return (
    <div>
      <h1 id="tableLabel">Weather forecast</h1>
      <p>This component demonstrates fetching data from the server.</p>
      {contents}
    </div>
  );
}

export default FetchData;
