// src/screens/SupportPolicyScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Phone, Mail, MessageCircle, Clock } from 'lucide-react-native';
import { NavigationService } from '../services/NavigationService';

export default function SupportPolicyScreen() {
  const handleCall = () => {
    Linking.openURL('tel:+15551234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@attendanceapp.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationService.goBack()}
        >
          <ArrowLeft size={24} color="#5B4BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Support Hours */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeader}>
            <Clock size={24} color="#5B4BFF" />
            <Text style={styles.cardTitle}>Support Hours</Text>
          </View>
          <Text style={styles.supportText}>
            Monday - Friday: 9:00 AM - 6:00 PM EST{'\n'}
            Saturday: 10:00 AM - 4:00 PM EST{'\n'}
            Sunday: Closed{'\n'}
            Emergency support available 24/7
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={styles.contactIcon}>
              <Phone size={20} color="#5B4BFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactDetail}>+1 (555) 123-4567</Text>
              <Text style={styles.contactNote}>Available during business hours</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIcon}>
              <Mail size={20} color="#5B4BFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDetail}>support@attendanceapp.com</Text>
              <Text style={styles.contactNote}>Response within 24 hours</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <MessageCircle size={20} color="#5B4BFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactDetail}>Available in-app</Text>
              <Text style={styles.contactNote}>Monday - Friday, 9 AM - 5 PM EST</Text>
            </View>
          </View>
        </View>

        {/* Support Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Guidelines</Text>

          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>What We Support</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Technical issues with the app</Text>
              <Text style={styles.bulletPoint}>• Account and login problems</Text>
              <Text style={styles.bulletPoint}>• Attendance tracking functionality</Text>
              <Text style={styles.bulletPoint}>• Biometric authentication setup</Text>
              <Text style={styles.bulletPoint}>• Report generation and data export</Text>
              <Text style={styles.bulletPoint}>• Feature explanations and guidance</Text>
            </View>
          </View>

          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>Before Contacting Support</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Check our FAQ section in the app</Text>
              <Text style={styles.bulletPoint}>• Ensure your app is updated to the latest version</Text>
              <Text style={styles.bulletPoint}>• Restart your device and try again</Text>
              <Text style={styles.bulletPoint}>• Check your internet connection</Text>
              <Text style={styles.bulletPoint}>• Clear app cache if experiencing issues</Text>
            </View>
          </View>
        </View>

        {/* Response Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response Times</Text>

          <View style={styles.responseCard}>
            <View style={styles.responseItem}>
              <Text style={styles.responseType}>Phone Support</Text>
              <Text style={styles.responseTime}>Immediate (during business hours)</Text>
            </View>
            <View style={styles.responseItem}>
              <Text style={styles.responseType}>Live Chat</Text>
              <Text style={styles.responseTime}>Within 5 minutes (during business hours)</Text>
            </View>
            <View style={styles.responseItem}>
              <Text style={styles.responseType}>Email Support</Text>
              <Text style={styles.responseTime}>Within 24 hours</Text>
            </View>
            <View style={styles.responseItem}>
              <Text style={styles.responseType}>Emergency Issues</Text>
              <Text style={styles.responseTime}>Within 1 hour (24/7)</Text>
            </View>
          </View>
        </View>

        {/* Emergency Support */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Support</Text>
          <Text style={styles.emergencyText}>
            For critical system outages or urgent security issues, call our emergency line:
          </Text>
          <Text style={styles.emergencyNumber}>+1 (555) 911-HELP</Text>
          <Text style={styles.emergencyNote}>
            Available 24/7 for system-critical issues only
          </Text>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Help Center</Text>
            <Text style={styles.resourceDescription}>
              Access our comprehensive knowledge base with tutorials, troubleshooting guides,
              and frequently asked questions.
            </Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Video Tutorials</Text>
            <Text style={styles.resourceDescription}>
              Watch step-by-step video guides for setting up your account, using attendance
              features, and maximizing productivity.
            </Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Community Forum</Text>
            <Text style={styles.resourceDescription}>
              Connect with other users, share tips, and get answers from the community.
              Moderated by our support team.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
  },
  supportText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 16,
    color: '#5B4BFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactNote: {
    fontSize: 14,
    color: '#64748B',
  },
  guidelineCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 6,
  },
  responseCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  responseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  responseType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  responseTime: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#991B1B',
    marginBottom: 12,
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencyNote: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
});