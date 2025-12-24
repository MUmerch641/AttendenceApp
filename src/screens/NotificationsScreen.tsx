// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Megaphone,
  Clock,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react-native';
import { NotificationsAPI, Notification } from '../api/notifications';
import { StorageService } from '../services/StorageService';
import { SnackbarService } from '../services/SnackbarService';
import { ErrorHandler } from '../utils/errorHandler';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

type NotificationsNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'general'>('general');
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const userData = await StorageService.getUserData();
      if (userData?._id) {
        setUserId(userData._id);
      }
    };
    fetchUserId();
  }, []);

  const loadNotifications = async (showLoader = true) => {
    if (!userId) {
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
        setError(null);
      }
      
      // Fetch notifications
      const response = await NotificationsAPI.getUserNotifications(userId);
      
      if (response.isSuccess && response.data) {
        const notificationsList = Array.isArray(response.data) ? response.data : [];
        setNotifications(notificationsList);
        
        // Calculate unread count
        const unread = notificationsList.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
        
        setError(null);
      } else {
        const errorMsg = response.message || 'Failed to load notifications';
        if (showLoader) {
          setError(errorMsg);
          setErrorType('server');
        } else {
          SnackbarService.showError(errorMsg);
        }
      }
    } catch (error) {
      const parsedError = ErrorHandler.parseError(error);
      
      if (showLoader) {
        setError(parsedError.message);
        setErrorType(parsedError.isNetworkError ? 'network' : parsedError.isServerError ? 'server' : 'general');
      } else {
        ErrorHandler.showError(error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await NotificationsAPI.markAsRead(notificationId, userId);
      
      if (response.isSuccess) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        ErrorHandler.showError(new Error(response.message || 'Failed to mark as read'));
      }
    } catch (error) {
      ErrorHandler.showError(error, 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    try {
      await NotificationsAPI.markAllAsRead(userId, notifications);
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      SnackbarService.showSuccess('All notifications marked as read');
    } catch (error) {
      ErrorHandler.showError(error, 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await NotificationsAPI.deleteNotification(notificationId, userId);
      
      if (response.isSuccess) {
        // Update local state
        const deletedNotif = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Update unread count if deleted notification was unread
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        SnackbarService.showSuccess('Notification deleted');
      } else {
        ErrorHandler.showError(new Error(response.message || 'Failed to delete notification'));
      }
    } catch (error) {
      ErrorHandler.showError(error, 'Failed to delete notification');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'leave_approved':
        return <CheckCircle size={24} color="#10B981" />;
      case 'leave_rejected':
        return <XCircle size={24} color="#EF4444" />;
      case 'leave_pending':
        return <Clock size={24} color="#F59E0B" />;
      case 'announcement':
        return <Megaphone size={24} color="#5B4BFF" />;
      case 'reminder':
        return <AlertCircle size={24} color="#F59E0B" />;
      default:
        return <FileText size={24} color="#64748B" />;
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'leave_approved':
        return '#10B98115';
      case 'leave_rejected':
        return '#EF444415';
      case 'leave_pending':
        return '#F59E0B15';
      case 'announcement':
        return '#5B4BFF15';
      case 'reminder':
        return '#F59E0B15';
      default:
        return '#64748B15';
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, item: Notification) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleDeleteNotification(item._id)}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={24} color="#FFFFFF" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <View style={styles.notificationContainer}>
        <Swipeable
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          overshootRight={false}
          friction={2}
        >
          <TouchableOpacity
            style={[
              styles.notificationCard,
              !item.isRead && styles.unreadCard,
            ]}
            onPress={() => !item.isRead && handleMarkAsRead(item._id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) }]}>
              {getNotificationIcon(item.type)}
            </View>
            
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.notificationMeta}>
                  <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
              </View>
              
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        message="No Notifications"
        description="You're all caught up! Check back later for updates."
        icon="bell"
      />
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={styles.safeArea}>
        <SafeAreaView style={{flex: 1}} edges={['top']}>
          {/* Decorative Blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#0B1226" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B4BFF" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={styles.safeArea}>
        <SafeAreaView style={{flex: 1}} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#0B1226" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          <ErrorState
            message={error}
            type={errorType}
            onRetry={() => loadNotifications(true)}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={styles.safeArea}>
        <SafeAreaView style={{flex: 1}} edges={['top']}>
          {/* Decorative Blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#0B1226" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            {unreadCount > 0 ? (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
              >
                <CheckCheck size={20} color="#5B4BFF" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* Notifications List */}
          <FlashList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#5B4BFF']}
                tintColor="#5B4BFF"
              />
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
    marginLeft: -44,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  markAllButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  notificationContainer: {
    marginBottom: 12,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#5B4BFF',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    letterSpacing: -0.2,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5B4BFF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 0,
  },
  notificationTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1226',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  blob1: {
    position: 'absolute',
    top: 60,
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#5B4BFF18',
  },
  blob2: {
    position: 'absolute',
    top: 200,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#FF7A0018',
  },
});
