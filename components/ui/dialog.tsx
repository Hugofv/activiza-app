import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Typography } from './Typography';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
};

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogTriggerProps & React.ComponentPropsWithoutRef<typeof Pressable>
>(({ children, asChild, ...props }, ref) => {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onPress: () => {
        onOpenChange(true);
        if (props.onPress) {
          props.onPress({} as any);
        }
      },
    } as any);
  }

  return (
    <Pressable ref={ref} onPress={() => onOpenChange(true)} {...props}>
      {children}
    </Pressable>
  );
});
DialogTrigger.displayName = 'DialogTrigger';

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof View>,
  DialogContentProps
>(({ children, className, ...props }, ref) => {
  const { open, onOpenChange } = useDialogContext();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          ref={ref}
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
});
DialogContent.displayName = 'DialogContent';

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <View style={styles.header}>{children}</View>;
};
DialogHeader.displayName = 'DialogHeader';

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogTitle = ({ children }: DialogTitleProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Typography
      variant="h4"
      style={[styles.title, { color: colors.text }]}
    >
      {children}
    </Typography>
  );
};
DialogTitle.displayName = 'DialogTitle';

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogDescription = ({ children }: DialogDescriptionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Typography
      variant="body2"
      style={[styles.description, { color: colors.icon }]}
    >
      {children}
    </Typography>
  );
};
DialogDescription.displayName = 'DialogDescription';

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DialogFooter = ({ children }: DialogFooterProps) => {
  return <View style={styles.footer}>{children}</View>;
};
DialogFooter.displayName = 'DialogFooter';

interface DialogCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogCloseProps & React.ComponentPropsWithoutRef<typeof Pressable>
>(({ children, asChild, ...props }, ref) => {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onPress: () => {
        onOpenChange(false);
        if (props.onPress) {
          props.onPress({} as any);
        }
      },
    } as any);
  }

  return (
    <Pressable ref={ref} onPress={() => onOpenChange(false)} {...props}>
      {children}
    </Pressable>
  );
});
DialogClose.displayName = 'DialogClose';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
});

export {
   Dialog, DialogClose, DialogContent, DialogDescription,
   DialogFooter, DialogHeader,
   DialogTitle, DialogTrigger
};

