import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS } from '../styles/globalStyles';
import Lucide from '@react-native-vector-icons/lucide';

const { width } = Dimensions.get('window');

const WeatherHeader = ({ city, onSearchPress }) => {
  return (
    <View style={styles.header}>
      {/* City name */}
      <Text style={styles.cityText}>{city}</Text>

      {/* Search button */}
      <TouchableOpacity onPress={onSearchPress}>
        <View style={styles.lucideicon}>
          <Lucide name="search" color={COLORS.white} size={20} />
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
    padding: width * 0.04,
  },
  lucideicon: {
    backgroundColor: COLORS.overlay,
    width: width * 0.12,
    height: width * 0.12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: width * 0.06,
  },
  cityText: {
    fontSize: width * 0.07,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textShadowColor: '#0000004d',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

export default WeatherHeader;
