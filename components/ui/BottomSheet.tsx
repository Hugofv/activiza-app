import * as React from 'react';

import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
}: BottomSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
    }
  }, [visible, translateY]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newTranslateY = context.value.y + event.translationY;

      // Se tentar arrastar para cima (valores negativos), aplica resistência
      if (newTranslateY < 0) {
        // Efeito rubber band: quanto mais arrasta, menor o movimento
        const resistance = Math.abs(newTranslateY);
        const damping = 3; // Quanto maior, mais resistência
        translateY.value = -resistance / damping;
      } else {
        // Permite arrastar para baixo normalmente
        translateY.value = newTranslateY;
      }
    })
    .onEnd(() => {
      const shouldClose = translateY.value > SCREEN_HEIGHT * 0.2;

      if (shouldClose) {
        translateY.value = withSpring(SCREEN_HEIGHT, {
          damping: 25,
          stiffness: 120,
          mass: 0.8,
        });
        runOnJS(onClose)();
      } else {
        // Sempre volta para a posição inicial (0)
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 150,
          mass: 0.5,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {transform: [{ translateY: translateY.value }],};
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: colors.background,
      opacity: 1,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {opacity,};
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
        <TouchableWithoutFeedback
          onPress={onClose}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.container, containerAnimatedStyle, animatedStyle]}
          >
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: colors.icon }]} />

            {/* Title */}
            {title && (
              <View style={styles.titleContainer}>
                <Typography
                  variant="body2SemiBold"
                  style={styles.title}
                  color="text"
                >
                  {title}
                </Typography>
                <View
                  style={[styles.titleLine, { backgroundColor: colors.icon }]}
                />
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: 280,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.3,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  titleLine: {
    width: '100%',
    height: 1,
    opacity: 0.1,
  },
  content: {paddingHorizontal: 24,},
});
