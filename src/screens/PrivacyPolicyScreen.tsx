// src/screens/PrivacyPolicyScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { NavigationService } from '../services/NavigationService';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>Last updated: November 27, 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account,
            use our attendance tracking features, or contact us for support. This may include:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Personal information (name, email, phone number)</Text>
            <Text style={styles.bulletPoint}>• Employment information (employee ID, department)</Text>
            <Text style={styles.bulletPoint}>• Attendance data (check-in/check-out times, location)</Text>
            <Text style={styles.bulletPoint}>• Device information and biometric data for authentication</Text>
          </View>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Provide and maintain our attendance tracking service</Text>
            <Text style={styles.bulletPoint}>• Process and verify attendance records</Text>
            <Text style={styles.bulletPoint}>• Generate reports for your organization</Text>
            <Text style={styles.bulletPoint}>• Improve our services and develop new features</Text>
            <Text style={styles.bulletPoint}>• Communicate with you about updates and support</Text>
          </View>

          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or otherwise transfer your personal information to third parties
            without your consent, except as described in this policy:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• With your employer for attendance management purposes</Text>
            <Text style={styles.bulletPoint}>• With service providers who assist in our operations</Text>
            <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
          </View>

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. This includes encryption
            of data in transit and at rest, secure authentication methods, and regular security audits.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services
            and comply with legal obligations. Attendance records are typically retained according
            to your organization's policies and applicable regulations.
          </Text>

          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Access and review your personal information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate or incomplete data</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your data (subject to legal requirements)</Text>
            <Text style={styles.bulletPoint}>• Opt out of certain data processing activities</Text>
            <Text style={styles.bulletPoint}>• Request data portability</Text>
          </View>

          <Text style={styles.sectionTitle}>7. Biometric Data</Text>
          <Text style={styles.paragraph}>
            For biometric authentication features, we collect and process fingerprint or facial
            recognition data solely for the purpose of secure attendance tracking. This data is
            encrypted and stored securely, and is only used for authentication purposes within
            our application.
          </Text>

          <Text style={styles.sectionTitle}>8. Location Data</Text>
          <Text style={styles.paragraph}>
            Our app may collect location data to verify attendance at designated work locations.
            Location data is used only for attendance verification and is not shared with third
            parties without your consent.
          </Text>

          <Text style={styles.sectionTitle}>9. Cookies and Analytics</Text>
          <Text style={styles.paragraph}>
            We may use cookies and similar technologies to enhance your experience and analyze
            app usage patterns. You can control cookie preferences through your device settings.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new policy on this page and updating the "Last updated" date.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>Email: privacy@attendanceapp.com</Text>
            <Text style={styles.contactText}>Phone: +1 (555) 123-4567</Text>
            <Text style={styles.contactText}>Address: 123 Business Street, Suite 100</Text>
            <Text style={styles.contactText}>City, State 12345</Text>
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
  lastUpdated: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 16,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
  },
  contactInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
});