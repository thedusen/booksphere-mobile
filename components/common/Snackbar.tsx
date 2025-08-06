import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
  Vibration,
  AccessibilityInfo,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Clock, Loader, X } from 'lucide-react-native';

export type SnackbarType = 'success' | 'info' | 'warning' | 'error';

export interface SnackbarAction {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
}

export interface SnackbarProps {
  id: string;
  type: SnackbarType;
  message: string;
  duration?: number;
  action?: SnackbarAction;
  onDismiss: (id: string) => void;
  visible: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;

const getSnackbarConfig = (type: SnackbarType) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#1FB1AB',
        borderColor: '#1FB1AB',
        textColor: '#ffffff',
        icon: CheckCircle2,
        iconColor: '#ffffff',
        accessibilityRole: 'none' as const,
        liveRegion: 'polite' as const,
      };
    case 'info':
      return {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        textColor: '#ffffff',
        icon: Clock,
        iconColor: '#ffffff',
        accessibilityRole: 'none' as const,
        liveRegion: 'polite' as const,
      };
    case 'warning':
      return {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
        textColor: '#ffffff',
        icon: Loader,
        iconColor: '#ffffff',
        accessibilityRole: 'none' as const,
        liveRegion: 'polite' as const,
      };
    case 'error':
      return {
        backgroundColor: '#C7006F',
        borderColor: '#C7006F',
        textColor: '#ffffff',
        icon: AlertCircle,
        iconColor: '#ffffff',
        accessibilityRole: 'none' as const,
        liveRegion: 'assertive' as const,
      };
    default:
      return {
        backgroundColor: '#374151',
        borderColor: '#374151',
        textColor: '#ffffff',
        icon: Clock,
        iconColor: '#ffffff',
        accessibilityRole: 'none' as const,
        liveRegion: 'polite' as const,
      };
  }
};

export const Snackbar: React.FC<SnackbarProps> = ({
  id,
  type,
  message,
  duration = 4000,
  action,
  onDismiss,
  visible,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

  const config = getSnackbarConfig(type);
  const IconComponent = config.icon;

  useEffect(() => {
    // Check for reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);
  }, []);

  useEffect(() => {
    if (visible) {
      // Haptic feedback for different types
      if (type === 'error') {
        Vibration.vibrate([0, 100, 50, 100]); // Error pattern
      } else if (type === 'success') {
        Vibration.vibrate(50); // Success feedback
      }

      // Animate in
      if (isReducedMotionEnabled) {
        // Reduced motion: simple fade
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // Full animation: slide up and fade
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Auto-dismiss timer
      if (duration > 0) {
        dismissTimer.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };
  }, [visible, duration, isReducedMotionEnabled]);

  const handleDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }

    if (isReducedMotionEnabled) {
      // Reduced motion: simple fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onDismiss(id);
      });
    } else {
      // Full animation: slide down and fade
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss(id);
      });
    }
  };

  // Create pan responder for swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        // Reset the animated value offset when starting gesture
        translateY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipes
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 0.5) {
          // Dismiss if swiped far enough or fast enough
          handleDismiss();
        } else {
          // Snap back to position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) {
    return null;
  }

  const accessibilityLabel = `${type === 'error' ? 'Error: ' : ''}${message}${
    action ? ` ${action.label} button available.` : ''
  }`;

  const containerStyle = [
    styles.container,
    {
      bottom: insets.bottom + 16,
      backgroundColor: config.backgroundColor,
      borderColor: config.borderColor,
    }
  ];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        containerStyle,
        {
          transform: [{ translateY }, { translateX }],
          opacity,
        }
      ]}
      accessibilityRole={config.accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={config.liveRegion}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <IconComponent size={20} color={config.iconColor} />
        </View>
        
        {/* Message */}
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
        
        {/* Action Button */}
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={action.accessibilityHint}
          >
            <Text style={styles.actionText}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Dismiss Button */}
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <X size={18} color={config.iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    // Use elevation for Android shadow
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});