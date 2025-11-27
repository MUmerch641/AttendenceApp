// src/screens/TermsConditionsScreen.tsx
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

export default function TermsConditionsScreen() {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>Last updated: November 27, 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using the Attendance App ("the App"), you agree to be bound
            by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not
            use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            The Attendance App is a mobile application designed to help organizations track employee
            attendance through biometric authentication, GPS location verification, and manual time
            tracking. The service includes attendance logging, reporting, leave management, and
            administrative oversight features.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of the App, you must create an account. You are responsible for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account credentials</Text>
            <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
            <Text style={styles.bulletPoint}>• Providing accurate and complete information</Text>
            <Text style={styles.bulletPoint}>• Notifying us immediately of any unauthorized use</Text>
          </View>

          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree to use the App only for lawful purposes and in accordance with these Terms.
            You shall not:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Use the App for any illegal or unauthorized purpose</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
            <Text style={styles.bulletPoint}>• Interfere with or disrupt the App's functionality</Text>
            <Text style={styles.bulletPoint}>• Upload or transmit harmful code or malware</Text>
            <Text style={styles.bulletPoint}>• Impersonate any person or entity</Text>
            <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          </View>

          <Text style={styles.sectionTitle}>5. Biometric Data and Privacy</Text>
          <Text style={styles.paragraph}>
            The App may collect biometric data (such as fingerprints or facial recognition) for
            authentication purposes. You consent to the collection, storage, and processing of such
            data solely for attendance tracking. We handle all biometric data in accordance with
            our Privacy Policy and applicable privacy laws.
          </Text>

          <Text style={styles.sectionTitle}>6. Location Services</Text>
          <Text style={styles.paragraph}>
            The App may use GPS and location services to verify attendance at designated work
            locations. By using location features, you consent to the collection and use of your
            location data for attendance verification purposes only.
          </Text>

          <Text style={styles.sectionTitle}>7. Data Accuracy</Text>
          <Text style={styles.paragraph}>
            While we strive to provide accurate attendance tracking, the App's functionality depends
            on various factors including device capabilities, network connectivity, and user input.
            You acknowledge that attendance records may not be 100% accurate in all circumstances.
          </Text>

          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The App and its original content, features, and functionality are owned by us and are
            protected by copyright, trademark, and other intellectual property laws. You may not
            copy, modify, distribute, or create derivative works of the App without our prior written consent.
          </Text>

          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account and access to the App at our
            sole discretion, without prior notice, for conduct that we believe violates these Terms
            or is harmful to other users, us, or third parties.
          </Text>

          <Text style={styles.sectionTitle}>10. Disclaimers</Text>
          <Text style={styles.paragraph}>
            The App is provided "as is" without warranties of any kind. We disclaim all warranties,
            express or implied, including but not limited to merchantability, fitness for a particular
            purpose, and non-infringement. We do not guarantee that the App will be uninterrupted,
            error-free, or secure.
          </Text>

          <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall we be liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or related to your use of the App. Our total liability
            shall not exceed the amount paid by you for the App in the twelve months preceding the claim.
          </Text>

          <Text style={styles.sectionTitle}>12. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses
            arising from your use of the App, violation of these Terms, or infringement of any rights
            of another party.
          </Text>

          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the
            jurisdiction in which our company is incorporated, without regard to conflict of law principles.
          </Text>

          <Text style={styles.sectionTitle}>14. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of material
            changes via email or through the App. Continued use of the App after such modifications
            constitutes acceptance of the updated Terms.
          </Text>

          <Text style={styles.sectionTitle}>15. Severability</Text>
          <Text style={styles.paragraph}>
            If any provision of these Terms is found to be unenforceable, the remaining provisions
            will remain in full force and effect.
          </Text>

          <Text style={styles.sectionTitle}>16. Entire Agreement</Text>
          <Text style={styles.paragraph}>
            These Terms constitute the entire agreement between you and us regarding the use of
            the App and supersede all prior agreements and understandings.
          </Text>

          <Text style={styles.sectionTitle}>17. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>Email: legal@attendanceapp.com</Text>
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