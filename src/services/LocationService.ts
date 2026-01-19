// src/services/LocationService.ts
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationCoordinates {
    latitude: number;
    longitude: number;
}

export interface LocationResult {
    success: boolean;
    coordinates?: LocationCoordinates;
    error?: string;
}

/**
 * LocationService
 * 
 * Handles location permissions and fetching current coordinates
 * using @react-native-community/geolocation.
 */
export const LocationService = {
    /**
     * Request location permission from the user
     * @returns Promise<boolean> - true if permission granted
     */
    requestPermission: async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'ios') {
                // iOS handles permission in the Geolocation.getCurrentPosition call
                return true;
            }

            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission Required',
                        message: 'leohours needs access to your location to mark attendance.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    // User selected "Don't ask again"
                    LocationService.showSettingsAlert();
                    return false;
                }
                return false;
            }

            return false;
        } catch (error) {
            return false;
        }
    },

    /**
     * Check if location permission is granted
     * @returns Promise<boolean>
     */
    checkPermission: async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted;
            }
            // iOS - we'll check during getCurrentPosition
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get position with specific options
     * @returns Promise<LocationResult>
     */
    getPositionWithOptions: (options: {
        enableHighAccuracy: boolean;
        timeout: number;
        maximumAge: number;
    }): Promise<LocationResult> => {
        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        success: true,
                        coordinates: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to get your location. ';

                    // Error codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
                    switch (error.code) {
                        case 1:
                            errorMessage += 'Location permission was denied.';
                            break;
                        case 2:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case 3:
                            errorMessage += 'Location request timed out.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                    }

                    resolve({
                        success: false,
                        error: errorMessage,
                        // Include error code for fallback logic
                    });
                },
                options
            );
        });
    },

    /**
     * Get current location coordinates
     * Uses a fallback strategy: high accuracy first, then low accuracy if timeout
     * @returns Promise<LocationResult>
     */
    getCurrentLocation: async (): Promise<LocationResult> => {
        try {
            // First request permission
            const hasPermission = await LocationService.requestPermission();

            if (!hasPermission) {
                return {
                    success: false,
                    error: 'Location permission denied. Please enable location access in settings.',
                };
            }

            // Try with high accuracy first (uses GPS)
            const highAccuracyResult = await LocationService.getPositionWithOptions({
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds for GPS
                maximumAge: 60000, // Accept 1-minute old cached position
            });

            if (highAccuracyResult.success) {
                return highAccuracyResult;
            }

            // If high accuracy failed (likely timeout indoors), try low accuracy (uses network/WiFi)
            const lowAccuracyResult = await LocationService.getPositionWithOptions({
                enableHighAccuracy: false,
                timeout: 15000, // 15 seconds for network location
                maximumAge: 120000, // Accept 2-minute old cached position
            });

            if (lowAccuracyResult.success) {
                return lowAccuracyResult;
            }

            // Both failed - return the low accuracy error (more informative)
            return {
                success: false,
                error: 'Could not determine your location. Please ensure GPS/Location is enabled and you have a clear view of the sky or good network connectivity.',
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get location. Please check your device settings.',
            };
        }
    },

    /**
     * Show alert to open app settings
     */
    showSettingsAlert: () => {
        Alert.alert(
            'Location Permission Required',
            'Location access is required to mark attendance. Please enable it in your device settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                        } else {
                            Linking.openSettings();
                        }
                    }
                },
            ]
        );
    },
};

export default LocationService;
