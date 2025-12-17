import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function ConfirmLogoutModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <LogOut size={28} color="#FFF" />
          </View>

          <Text style={styles.title}>Confirm Logout</Text>
          <Text style={styles.message}>Are you sure you want to logout?</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0B1226', marginBottom: 8 },
  message: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  buttonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  button: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancel: { backgroundColor: '#F1F5F9', marginRight: 8 },
  confirm: { backgroundColor: '#FF5252', marginLeft: 8 },
  cancelText: { color: '#64748B', fontWeight: '700' },
  confirmText: { color: '#FFF', fontWeight: '800' },
});
