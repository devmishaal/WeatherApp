import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import * as Animatable from 'react-native-animatable';

import { fetchCurrentWeather, fetchForecast } from '../utils/apiHandler';
import { globalStyles, COLORS, FONTS } from '../styles/globalStyles';

import CitySearchModal from '../components/CitySearchModal';
import WeatherStatCard from '../components/WeatherStatCard';
import WeatherHeader from '../components/WeatherHeader';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [sunriseTime, setSunriseTime] = useState('');
  const [sunsetTime, setSunsetTime] = useState('');
  const [cityName, setCityName] = useState('');
  const [weather, setWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [coords, setCoords] = useState({ lat: null, long: null });
  const [loading, setLoading] = useState(true);

  // Get current location
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const lat = info.coords.latitude;
        const long = info.coords.longitude;
        setCoords({ lat, long });
        loadWeather({ lat, long });
        loadForecast({ lat, long });
      },
      error => {
        console.error('Geolocation error:', error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSelectCity = cityObj => {
    if (!cityObj || !cityObj.city || !cityObj.lat || !cityObj.long) return;
    setCityName(cityObj.city);
    setCoords({ lat: cityObj.lat, long: cityObj.long });
  };

  // Fetch current weather
  const loadWeather = async ({ lat, long, city }) => {
    try {
      setLoading(true);
      const json = await fetchCurrentWeather({ lat, long, city });
      setWeather(json);

      const timezoneOffset = json.timezone;

      const formatTime = timestamp => {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = ((hours + 11) % 12) + 1;
        return `${h}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      };

      const dt = new Date((json.dt + timezoneOffset) * 1000);
      const dateStr = `${dt.getUTCDate()} ${dt.toLocaleString('en-US', {
        month: 'short',
      })} ${dt.getUTCFullYear()} | ${formatTime(json.dt)}`;

      setCurrentDateTime(dateStr);
      setSunriseTime(formatTime(json.sys.sunrise));
      setSunsetTime(formatTime(json.sys.sunset));
    } catch (error) {
      console.error('Error fetching current weather:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch forecast
  const loadForecast = async ({ lat, long, city }) => {
    try {
      const json = await fetchForecast({ lat, long, city });
      const timezoneOffset = json.city.timezone;

      const formatTime = timestamp => {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = ((hours + 11) % 12) + 1;
        return `${h}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      };

      // Hourly (next 7)
      const hourly = json.list.slice(0, 7).map(item => ({
        dt: item.dt,
        time: formatTime(item.dt),
        temp: item.main.temp,
        weather: item.weather,
      }));

      // Daily (group by date)
      const grouped = {};
      json.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });

      const daily = Object.entries(grouped)
        .slice(0, 7)
        .map(([_, items]) => {
          const temps = items.map(i => i.main.temp);
          const min = Math.min(...temps);
          const max = Math.max(...temps);
          return {
            dt: items[0].dt,
            temp: { min, max },
            weather: items[0].weather,
          };
        });

      setHourlyData(hourly);
      setDailyData(daily);
    } catch (error) {
      console.error('Error fetching forecast:', error.message);
    }
  };

  // Load on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Reload when city changes
  useEffect(() => {
    if (cityName) {
      loadWeather({ city: cityName });
      loadForecast({ city: cityName });
    }
  }, [cityName]);

  // Loader
  if (loading || !weather?.main || !weather?.weather) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.primary}
          />
          <Text style={globalStyles.textBold}>Loading weather data...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{ flex: 1 }}
      >
        <WeatherHeader
          city={weather?.name}
          onSearchPress={() => setModalVisible(true)}
        />

        <CitySearchModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelectCity={handleSelectCity}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: width * 0.04 }}
        >
          {/* Date & Time */}
          <View style={{ alignItems: 'center', marginBottom: height * 0.015 }}>
            <Text style={globalStyles.textRegular}>{currentDateTime}</Text>
          </View>

          {/* Current Weather */}
          <View style={{ alignItems: 'center', marginBottom: height * 0.03 }}>
            <Animatable.Image
              animation="pulse"
              easing="ease-in-out"
              iterationCount="infinite"
              duration={2000}
              source={{
                uri: `https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@4x.png`,
              }}
              style={{
                width: width * 0.55,
                height: height * 0.18,
                resizeMode: 'contain',
              }}
            />
            <Text style={globalStyles.textBold}>{weather?.main?.temp} °C</Text>
            <Text style={globalStyles.textRegular}>
              {weather?.weather?.[0]?.main}
            </Text>
            <Text style={globalStyles.textRegular}>
              High: {weather?.main?.temp_max} °C
            </Text>
            <Text style={globalStyles.textRegular}>
              Low: {weather?.main?.temp_min} °C
            </Text>
          </View>

          {/* Hourly Forecast */}
          <Text style={globalStyles.title}>Hourly Forecast</Text>
          <FlatList
            horizontal
            data={hourlyData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const icon = item.weather?.[0]?.icon;
              return (
                <View
                  style={[
                    globalStyles.card,
                    { alignItems: 'center', marginRight: width * 0.03 },
                  ]}
                >
                  <Text style={globalStyles.textRegular}>{item.time}</Text>
                  <Animatable.Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    }}
                    style={{ width: width * 0.1, height: width * 0.1 }}
                    animation="pulse"
                    easing="ease-in-out"
                    iterationCount="infinite"
                    duration={2000}
                  />
                  <Text style={globalStyles.textRegular}>
                    {Math.round(item.temp)} °C
                  </Text>
                </View>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />

          {/* Weekly Forecast */}
          <Text style={globalStyles.title}>Weekly Forecast</Text>
          <FlatList
            data={dailyData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const icon = item.weather?.[0]?.icon;
              const dayName = new Date(item.dt * 1000).toLocaleDateString(
                'en-US',
                {
                  weekday: 'long',
                },
              );
              return (
                <View
                  style={[
                    globalStyles.card,
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Text style={globalStyles.textRegular}>{dayName}</Text>
                  <Animatable.Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    }}
                    style={{ width: width * 0.1, height: width * 0.1 }}
                    animation="pulse"
                    easing="ease-in-out"
                    iterationCount="infinite"
                    duration={2000}
                  />
                  <Text style={globalStyles.textRegular}>
                    {item.weather?.[0]?.main}
                  </Text>
                  <View
                    style={{ flexDirection: 'column', alignItems: 'flex-end' }}
                  >
                    <Text style={globalStyles.textRegular}>
                      High: {Math.round(item.temp.max)}°
                    </Text>
                    <Text style={globalStyles.textRegular}>
                      Low: {Math.round(item.temp.min)}°
                    </Text>
                  </View>
                </View>
              );
            }}
            scrollEnabled={false}
          />

          {/* Current Conditions */}
          <Text style={globalStyles.title}>Current Conditions</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <WeatherStatCard
              label="Feels Like"
              value={`${weather?.main?.feels_like} °C`}
            />
            <WeatherStatCard
              label="Wind"
              value={`${weather?.wind?.speed} m/s`}
            />
            <WeatherStatCard
              label="Humidity"
              value={`${weather?.main?.humidity} %`}
            />
            <WeatherStatCard
              label="Pressure"
              value={`${weather?.main?.pressure} hPa`}
            />
            <WeatherStatCard
              label="Visibility"
              value={`${weather?.visibility / 1000} km`}
            />
            <WeatherStatCard
              label="Cloudiness"
              value={`${weather?.clouds?.all} %`}
            />
            <WeatherStatCard label="Sunrise" value={sunriseTime} />
            <WeatherStatCard label="Sunset" value={sunsetTime} />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
