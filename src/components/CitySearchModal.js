import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Lucide from '@react-native-vector-icons/lucide';

import { globalStyles } from '../styles/globalStyles';
import { fetchCities } from '../utils/apiHandler';

const CitySearchModal = ({ visible, onClose, onSelectCity }) => {
  const [searchText, setSearchText] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchText) {
      setCityResults([]);
      setLoading(false);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const data = await fetchCities(searchText);
      setCityResults(data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const handleCityPress = item => {
    Keyboard.dismiss();
    onSelectCity({ city: item.name, lat: item.lat, long: item.lon });
    onClose();
    setSearchText('');
    setCityResults([]);
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="bounceIn"
      animationOut="fadeOutDown"
      backdropOpacity={0.3}
      style={{ margin: 0 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={['#43cea2', '#185a9d']}
            style={globalStyles.gradient}
          >
            <View style={globalStyles.topBar}>
              <TouchableOpacity onPress={onClose}>
                <View style={globalStyles.lucideicon}>
                  <Lucide name="arrow-left" color="#ffffff" size={24} />
                </View>
              </TouchableOpacity>

              <View style={globalStyles.searchContainer}>
                <TextInput
                  placeholder="Search city..."
                  placeholderTextColor="#ffffff"
                  style={globalStyles.input}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <Lucide name="search" size={22} color="white" />
              </View>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#fff"
                style={{ marginTop: 40 }}
              />
            ) : cityResults.length === 0 && searchText.length > 0 ? (
              <View style={globalStyles.noResultContainer}>
                <Text style={globalStyles.noResultText}>No cities found</Text>
              </View>
            ) : (
              <FlatList
                data={cityResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={globalStyles.cityItem}
                    onPress={() => handleCityPress(item)}
                  >
                    <Text style={globalStyles.cityText}>
                      {item.name}, {item.state ? item.state + ', ' : ''}
                      {item.country}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingTop: 20 }}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CitySearchModal;
