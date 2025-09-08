import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WeatherStatCard = ({ label, value }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
 statCard: {
    width: '47%',
    backgroundColor: '#ffffff26',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ffffff4d',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'MerriweatherSans-Regular',
    marginBottom: 4,
    opacity: 0.85,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'MerriweatherSans-Bold',
  },
});

export default WeatherStatCard;
