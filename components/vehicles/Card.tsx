import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

const Card: React.FC<{
  topRow: React.ReactNode;
  bottomRow: React.ReactNode;
  backgroundColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({
  style,
  topRow,
  bottomRow,
  backgroundColor,
  onPress,
}) => (
    <Pressable style={[styles.card, { backgroundColor }, style]} onPress={onPress}>
      {topRow}
      {bottomRow}
    </Pressable>
  )

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
})

export default Card;
