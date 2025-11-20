// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react-native';
import { NavigationService } from '../services/NavigationService';
import { AuthAPI } from '../api/auth';
import { SnackbarService } from '../services/SnackbarService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      SnackbarService.showError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await AuthAPI.login({ email, password });
      console.log('Login Response:', response);
      SnackbarService.showSuccess('Login successful!');
      // Assuming response has token or user data, navigate to home
      NavigationService.navigate('Dashboard');
    } catch (error: any) {
      console.log('Login Error:', error);
      const message = error.response?.data?.message || 'Login failed';
      SnackbarService.showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      SnackbarService.showError('Please enter your email');
      return;
    }

    setForgotLoading(true);
    try {
      await AuthAPI.forget({ email: forgotEmail });
      SnackbarService.showSuccess('Password reset email sent!');
      setModalVisible(false);
      setForgotEmail('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      SnackbarService.showError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Blobs */}
      <View style={styles.blobContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>

            {/* Engaging Lottie Animation (Same Feel as Welcome) */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={{ uri: 'https://lottie.host/4d2c16df-7b8c-43bc-8e9b-df196d6d0cc6/IRu5CA0oNT.lottie' }}
                autoPlay
                loop
                speed={0.8}
                style={styles.lottie}
                resizeMode="cover"
              />
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoPrefix}>Trusted</Text>
              <Text style={styles.logoMain}>HRM</Text>
            </View>

            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Log in to manage your workforce</Text>

            {/* Form Card */}
            <View style={styles.formCard}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Work Email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgot} onPress={() => setModalVisible(true)}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginBtnText}>Log In</Text>
                )}
              </TouchableOpacity>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color="#64748B" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Enter your email to receive reset instructions</Text>

            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Work Email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={forgotEmail}
                onChangeText={setForgotEmail}
              />
            </View>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.resetBtnText}>Send Reset Email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },

  blobContainer: { ...StyleSheet.absoluteFillObject, top: -120 },
  blob1: { position: 'absolute', top: 60, left: -100, width: 340, height: 340, borderRadius: 170, backgroundColor: '#5B4BFF18' },
  blob2: { position: 'absolute', top: 200, right: -120, width: 380, height: 380, borderRadius: 190, backgroundColor: '#FF7A0018' },

  lottieContainer: {
    width: width * 0.5,
    height: width * 0.4,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  lottie: { width: '100%', height: '100%' },

  logoContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  logoPrefix: { fontSize: 36, color: '#5B4BFF', fontWeight: '700' },
  logoMain: { fontSize: 36, color: '#FF7A00', fontWeight: '900' },

  title: { fontSize: 28, fontWeight: '800', color: '#0B1226', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },

  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 20,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#0F172A' },

  forgot: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#5B4BFF', fontWeight: '600', fontSize: 14 },

  loginBtn: {
    backgroundColor: '#5B4BFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1226',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: '#5B4BFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  resetBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

});