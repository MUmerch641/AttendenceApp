import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');

interface ImagePreviewModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ visible, imageUri, onClose }: ImagePreviewModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" barStyle="light-content" />
      
      {/* Backdrop - Light black opacity */}
      <TouchableOpacity 
        style={StyleSheet.absoluteFill} 
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.container} pointerEvents="box-none">
        {/* Image */}
        <Animated.View 
          style={[
            styles.imageContainer, 
            { 
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <View style={styles.imageWrapper}>
            <FastImage
              source={{ 
                uri: imageUri,
                priority: FastImage.priority.high,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.85,
    height: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.425, // Makes it circular
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 6,
    borderColor: '#5B4BFF',
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
