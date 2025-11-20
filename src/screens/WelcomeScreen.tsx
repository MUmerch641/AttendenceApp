import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { NavigationService } from '../services/NavigationService';



const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;
  
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Full Gradient Background */}
      <LinearGradient
        colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Decorative Wave/Blob Background */}
      <View style={styles.topWaveContainer}>
        <View style={styles.waveBlob1} />
        <View style={styles.waveBlob2} />
      </View>

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoPrefix}>Trusted</Text>
        <Text style={styles.logoMain}>HRM</Text>
      </View>

      {/* Illustration Section */}
      <View style={styles.illustrationContainer}>
        <View style={styles.figureBox}>
          <LottieView
            source={{ uri: 'https://assets.lottiefiles.com/packages/lf20_1pxqjqps.json' }}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>
          Smart HR solutions for a{"\n"}smarter workplace.
        </Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => NavigationService.navigate('LoginScreen')}>
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // Top decorative blobs (inspired by your screenshot)
  topWaveContainer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  waveBlob1: {
    position: 'absolute',
    top: 80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#5B4BFF22', // Very light purple
  },
  waveBlob2: {
    position: 'absolute',
    top: 160,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#FF7A0022', // Very light orange
  },

  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 30 : 50,
    zIndex: 10,
  },
  logoPrefix: {
    fontSize: 36,
    color: '#5B4BFF',
    fontWeight: '700',
  },
  logoMain: {
    fontSize: 36,
    color: '#FF7A00',
    fontWeight: '900',
  },

  illustrationContainer: {
    flex: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  figureBox: {
    width: width * 1.01,
    height: width * 1.01,
    borderRadius: 32,
    overflow: 'hidden',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },

  bottomCard: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: Platform.OS === 'ios' ? 34 : 25,
    alignSelf: 'center',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 12,
  },
  title: {
    fontSize: 22,
    lineHeight: 32,
    color: '#0B1226',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#5B4BFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});