import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ title, loading, variant = 'primary', disabled, style, ...rest }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        state.pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        (disabled || loading) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.onPrimary : Colors.primary} />
      ) : (
        <Text style={[styles.label, !isPrimary && styles.labelSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  primary: { backgroundColor: Colors.primary },
  primaryPressed: { backgroundColor: Colors.primaryPressed },
  secondary: { backgroundColor: 'transparent' },
  secondaryPressed: { backgroundColor: Colors.border },
  disabled: { opacity: 0.6 },
  label: { color: Colors.onPrimary, fontSize: 16, fontWeight: '600' },
  labelSecondary: { color: Colors.primary },
});
