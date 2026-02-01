/**
 * Custom Toast component for react-native-toast-message
 * Styled to match the app's design system
 */
import { StyleSheet, View } from 'react-native';

import BaseToast from 'react-native-toast-message';

import { Icon } from './Icon';
import { Typography } from './Typography';

export function Toast() {
  const toastConfig = {
    success: ({ text1, text2 }: any) => (
      <View
        style={[
          styles.toast,
          styles.successToast,
          { backgroundColor: '#10B981' },
        ]}
      >
        <Icon
          name="checkmark-circle"
          size={24}
          color="muted"
        />
        <View style={styles.textContainer}>
          {text1 && (
            <Typography
              variant="body2"
              style={styles.text}
            >
              {text1}
            </Typography>
          )}
          {text2 && (
            <Typography
              variant="caption"
              style={[styles.text, styles.subText]}
            >
              {text2}
            </Typography>
          )}
        </View>
      </View>
    ),
    error: ({ text1, text2 }: any) => (
      <View
        style={[
          styles.toast,
          styles.errorToast,
          { backgroundColor: '#EF4444' },
        ]}
      >
        <Icon
          name="close-circle"
          size={24}
          color="muted"
        />
        <View style={styles.textContainer}>
          {text1 && (
            <Typography
              variant="body2"
              style={styles.text}
            >
              {text1}
            </Typography>
          )}
          {text2 && (
            <Typography
              variant="caption"
              style={[styles.text, styles.subText]}
            >
              {text2}
            </Typography>
          )}
        </View>
      </View>
    ),
    info: ({ text1, text2 }: any) => (
      <View
        style={[styles.toast, styles.infoToast, { backgroundColor: '#3B82F6' }]}
      >
        <Icon
          name="information-circle"
          size={24}
          color="muted"
        />
        <View style={styles.textContainer}>
          {text1 && (
            <Typography
              variant="body2"
              style={styles.text}
            >
              {text1}
            </Typography>
          )}
          {text2 && (
            <Typography
              variant="caption"
              style={[styles.text, styles.subText]}
            >
              {text2}
            </Typography>
          )}
        </View>
      </View>
    ),
    warning: ({ text1, text2 }: any) => (
      <View
        style={[
          styles.toast,
          styles.warningToast,
          { backgroundColor: '#F59E0B' },
        ]}
      >
        <Icon
          name="warning"
          size={24}
          color="muted"
        />
        <View style={styles.textContainer}>
          {text1 && (
            <Typography
              variant="body2"
              style={styles.text}
            >
              {text1}
            </Typography>
          )}
          {text2 && (
            <Typography
              variant="caption"
              style={[styles.text, styles.subText]}
            >
              {text2}
            </Typography>
          )}
        </View>
      </View>
    ),
  };

  return <BaseToast config={toastConfig} />;
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 56,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
 width: 0,
height: 4 
},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successToast: {
    // backgroundColor: '#10B981', // Set dynamically
  },
  errorToast: {
    // backgroundColor: '#EF4444', // Set dynamically
  },
  infoToast: {
    // backgroundColor: '#3B82F6', // Set dynamically
  },
  warningToast: {
    // backgroundColor: '#F59E0B', // Set dynamically
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  text: {
    color: 'text',
    fontFamily: 'Inter_500Medium',
  },
  subText: {
    marginTop: 4,
    opacity: 0.9,
  },
});
