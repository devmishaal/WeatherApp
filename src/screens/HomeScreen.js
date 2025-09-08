import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
  ScrollView, 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import * as Animatable from 'react-native-animatable';
import CitySearchModal from '../components/CitySearchModal';
import WeatherStatCard from '../components/WeatherStatCard';
import WeatherHeader from '../components/WeatherHeader';

const API_KEY = 'a9e69cf557ecfe6ddbf4e72af2e21b2a';

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

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const lat = info.coords.latitude;
        const long = info.coords.longitude;
        setCoords({ lat, long });
        Currentweather({ lat, long });
        getWeeklyData({ lat, long });
      },
      error => {
        console.error('Geolocation error:', error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true},
    );
  };

  const handleSelectCity = cityObj => {
    if (!cityObj || !cityObj.city || !cityObj.lat || !cityObj.long) {
      console.warn('Invalid city object selected');
      return;
    }

    setCityName(cityObj.city);
    setCoords({ lat: cityObj.lat, long: cityObj.long });
  };

  const Currentweather = async ({ lat, long, city }) => {
    try {
      setLoading(true);
      let url = '';

      if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
      } else if (lat && long) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`;
      } else {
        throw new Error('No valid location for current weather.');
      }

      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok || !json.timezone) {
        throw new Error(json.message || 'Invalid weather data');
      }

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

  const getWeeklyData = async ({ lat, long, city }) => {
    try {
      let url = '';

      if (city) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
      } else if (lat && long) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`;
      } else {
        throw new Error('No valid location for forecast.');
      }

      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok || !json.city) {
        throw new Error(json.message || 'Invalid forecast data');
      }

      const timezoneOffset = json.city.timezone;

      const formatTime = timestamp => {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = ((hours + 11) % 12) + 1;
        return `${h}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      };

      const hourly = json.list.slice(0, 7).map(item => ({
        dt: item.dt,
        time: formatTime(item.dt),
        temp: item.main.temp,
        weather: item.weather,
      }));

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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (cityName) {
      Currentweather({ city: cityName });
      getWeeklyData({ city: cityName });
    }
  }, [cityName]);

  if (loading || !weather?.main || !weather?.weather) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#43cea2', '#185a9d']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <StatusBar barStyle="light-content" backgroundColor="#43cea2" />
          <Text style={[styles.statValue]}>Loading weather data...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  } else
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#43cea2" />
        <LinearGradient
          colors={['#43cea2', '#185a9d']}
          style={StyleSheet.absoluteFill}
        />

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
          contentContainerStyle={{ padding: 16 }}
        >
          <View style={styles.titles}>
            <Text style={styles.dateTimeCombined}>{currentDateTime}</Text>
          </View>

          <View style={styles.weatherDisplay}>
            <Animatable.Image
              animation="pulse"
              easing="ease-in-out"
              iterationCount="infinite"
              duration={2000}
              source={{
                uri: `https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@4x.png`,
              }}
              style={styles.weatherIcon}
            />
            <Text style={styles.temperature}>{weather?.main?.temp} °C</Text>
            <Text style={styles.condition}>{weather?.weather?.[0]?.main}</Text>
            <Text style={styles.highLow}>
              High: {weather?.main?.temp_max} °C
            </Text>
            <Text style={styles.highLow}>
              Low: {weather?.main?.temp_min} °C
            </Text>
          </View>

          <Text style={styles.title}>Hourly Forecast</Text>
          <FlatList
            horizontal
            data={hourlyData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const icon = item.weather?.[0]?.icon;
              return (
                <View style={styles.card}>
                  <Text style={styles.time}>{item.time}</Text>
                  <Animatable.Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    }}
                    style={styles.icon}
                    animation="pulse"
                    easing="ease-in-out"
                    iterationCount="infinite"
                    duration={2000}
                  />
                  <Text style={styles.temp}>{Math.round(item.temp)} °C</Text>
                </View>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.sectionDivider} />

          <Text style={styles.title}>Weekly Forecast</Text>
          <FlatList
            data={dailyData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const icon = item.weather?.[0]?.icon;
              const dayName = new Date(item.dt * 1000).toLocaleDateString(
                'en-US',
                { weekday: 'long' },
              );
              return (
                <View style={styles.item}>
                  <Text style={styles.day}>{dayName}</Text>
                  <Animatable.Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    }}
                    style={styles.icon}
                    animation="pulse"
                    easing="ease-in-out"
                    iterationCount="infinite"
                    duration={2000}
                  />
                  <Text style={styles.conditions}>
                    {item.weather?.[0]?.main}
                  </Text>
                  <Text style={styles.highlow}>
                    High: {Math.round(item.temp.max)}° Low:
                    {Math.round(item.temp.min)}°
                  </Text>
                </View>
              );
            }}
            scrollEnabled={false}
          />

          <View style={styles.sectionDivider} />

          <Text style={styles.title}>Current conditions</Text>
          <View style={styles.weatherStatsGrid}>
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
      </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
  titles: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeCombined: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'MerriweatherSans-Regular',
    opacity: 0.9,
    // marginBottom: 8,
  },

  weatherDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weatherIcon: {
    width: 235,
    height: 130,
  },
  temperature: {
    fontSize: 30,
    color: 'white',
    fontFamily: 'MerriweatherSans-Bold',
  },
  condition: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'MerriweatherSans-SemiBold',
  },
  highLow: {
    fontSize: 12,
    color: 'white',
    opacity: 0.85,
    fontFamily: 'MerriweatherSans-Regular',
  },
  title: {
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 5,
    fontFamily: 'MerriweatherSans-Bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff26',
    width: 80,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#ffffff4d',
  },
  time: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'MerriweatherSans-SemiBold',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  temp: {
    fontSize: 14,
    fontFamily: 'MerriweatherSans-Bold',
    color: '#ffffff',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#ffffff4d',
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
  },
  item: {
    backgroundColor: '#ffffff26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#ffffff4d',
  },
  day: {
    fontSize: 14,
    color: '#ffffff',
    width: 90,
    fontFamily: 'MerriweatherSans-Bold',
  },
  conditions: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'MerriweatherSans-Regular',
  },
  highlow: {
    fontSize: 13,
    color: '#ffffff',
    width: 80,
    textAlign: 'center',
    fontFamily: 'MerriweatherSans-SemiBold',
  },
  weatherStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'MerriweatherSans-Bold',
  },
});
