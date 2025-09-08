import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#43cea2',
  secondary: '#185a9d',
  white: '#ffffff',
  overlay: '#ffffff26',
  border: '#ffffff4d',
};

export const FONTS = {
  regular: 'MerriweatherSans-Regular',
  semiBold: 'MerriweatherSans-SemiBold',
  bold: 'MerriweatherSans-Bold',
};

export const globalStyles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: width * 0.05,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lucideicon: {
    backgroundColor: '#ffffff40',
    width: width * 0.11,
    height: width * 0.11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: width * 0.055,
    marginRight: width * 0.03,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff30',
    borderRadius: width * 0.08,
    paddingHorizontal: width * 0.04,
    alignItems: 'center',
    height: height * 0.06,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: width * 0.04,
    fontFamily: 'MerriweatherSans-Regular',
  },
  cityItem: {
    backgroundColor: '#ffffff20',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.04,
    marginVertical: height * 0.008,
    borderRadius: width * 0.035,
    marginHorizontal: width * 0.01,
  },
  cityText: {
    color: 'white',
    fontSize: width * 0.045,
    fontFamily: 'MerriweatherSans-SemiBold',
  },
  noResultContainer: {
    marginTop: height * 0.05,
    alignItems: 'center',
  },
  noResultText: {
    color: 'white',
    fontSize: width * 0.04,
    fontFamily: 'MerriweatherSans-Regular',
    opacity: 0.7,
  },
  title: {
    fontSize: width * 0.055,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    marginBottom: height * 0.015,
  },
  textRegular: {
    fontSize: width * 0.04,
    color: COLORS.white,
    fontFamily: FONTS.regular,
  },
  textBold: {
    fontSize: width * 0.045,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  card: {
    backgroundColor: COLORS.overlay,
    borderRadius: 16,
    padding: width * 0.04,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.01,
  },
});
