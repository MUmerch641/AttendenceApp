import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  type?: 'network' | 'server' | 'general';
  showRetry?: boolean;
}

export default function ErrorState({ 
  message = 'Something went wrong',
  onRetry,
  type = 'general',
  showRetry = true,
}: ErrorStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff size={64} color="#EF4444" strokeWidth={1.5} />;
      case 'server':
        return <AlertCircle size={64} color="#F59E0B" strokeWidth={1.5} />;
      default:
        return <AlertCircle size={64} color="#94A3B8" strokeWidth={1.5} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'No Connection';
      case 'server':
        return 'Server Error';
      default:
        return 'Error';
    }
  };

  return (
    <View style={styles.container}>
      {getIcon()}
      <Text style={styles.title}>{getTitle()}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <RefreshCw size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B4BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
