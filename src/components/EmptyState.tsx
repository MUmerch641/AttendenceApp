import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox, FileText, Calendar, Bell, Search } from 'lucide-react-native';

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: 'inbox' | 'file' | 'calendar' | 'bell' | 'search';
}

export default function EmptyState({ 
  message = 'No data found',
  description,
  icon = 'inbox',
}: EmptyStateProps) {
  const getIcon = () => {
    const iconProps = { size: 80, color: '#CBD5E1', strokeWidth: 1.5 };
    
    switch (icon) {
      case 'file':
        return <FileText {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'bell':
        return <Bell {...iconProps} />;
      case 'search':
        return <Search {...iconProps} />;
      default:
        return <Inbox {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      {getIcon()}
      <Text style={styles.message}>{message}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
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
    paddingVertical: 60,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
