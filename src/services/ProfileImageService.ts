// src/services/ProfileImageService.ts
import { NativeEventEmitter, NativeModules } from 'react-native';

// Simple event emitter for profile image updates
class SimpleEventEmitter {
  private listeners: Array<(imageUrl: string) => void> = [];

  emit(imageUrl: string) {
    this.listeners.forEach(listener => listener(imageUrl));
  }

  addListener(callback: (imageUrl: string) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (imageUrl: string) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
}

const profileImageEmitter = new SimpleEventEmitter();

export const ProfileImageService = {
  /**
   * Emit profile image update event
   * @param imageUrl - The new profile image URL
   */
  emitProfileImageUpdate: (imageUrl: string) => {
    profileImageEmitter.emit(imageUrl);
  },

  /**
   * Listen for profile image updates
   * @param callback - Function to call when profile image is updated
   * @returns Cleanup function to remove the listener
   */
  onProfileImageUpdate: (callback: (imageUrl: string) => void) => {
    profileImageEmitter.addListener(callback);
    
    // Return cleanup function
    return () => {
      profileImageEmitter.removeListener(callback);
    };
  },
};
