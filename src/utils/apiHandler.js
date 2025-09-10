import { API_KEY, BASE_URL } from '@env';

console.log('API KEY is', API_KEY);
console.log('first 5 of BASE_URL is', BASE_URL);
export const fetchCities = async search => {
  if (!search) return [];
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=10&appid=${API_KEY}`,
    );
    return await response.json();
  } catch (error) {
    console.log('Fetch error:', error);
    return [];
  }
};

export const fetchCurrentWeather = async ({ lat, long, city }) => {
  let url = '';

  if (city) {
    url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
  } else if (lat && long) {
    url = `${BASE_URL}/weather?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`;
  } else {
    throw new Error('No valid location for current weather.');
  }

  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok) throw new Error(json.message || 'Invalid weather data');

  return json;
};

export const fetchForecast = async ({ lat, long, city }) => {
  let url = '';

  if (city) {
    url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  } else if (lat && long) {
    url = `${BASE_URL}/forecast?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`;
  } else {
    throw new Error('No valid location for forecast.');
  }

  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok) throw new Error(json.message || 'Invalid forecast data');

  return json;
};
