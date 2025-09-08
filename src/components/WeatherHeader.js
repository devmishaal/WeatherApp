// WeatherHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Lucide from '@react-native-vector-icons/lucide';

const WeatherHeader = ({ city, onSearchPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <View style={styles.lucideicon}>
          <Lucide name="align-justify" color="#ffffff" size={22} />
        </View>
      </TouchableOpacity>

      <Text style={styles.cityText}>{city}</Text>

      <TouchableOpacity onPress={onSearchPress}>
        <View style={styles.lucideicon}>
          <Lucide name="search" color="#ffffff" size={20} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  lucideicon: {
    backgroundColor: '#ffffff26',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  cityText: {
    fontSize: 29,
    fontFamily: 'MerriweatherSans-Bold',
    color: 'white',
    textShadowColor: '#0000004d',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

export default WeatherHeader;
