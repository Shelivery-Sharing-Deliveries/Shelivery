import { forwardRef, useMemo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  required?: boolean;
  className?: string;
  autoComplete?: string;
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 4,
      width: "100%",
    },
    label: {
      fontSize: 12,
      fontWeight: "500",
      color: colors["shelivery-text-secondary"],
    },
    input: {
      borderWidth: 1,
      borderColor: colors["shelivery-card-border"],
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      color: colors["shelivery-text-primary"],
      backgroundColor: isDark ? colors["shelivery-card-background"] : "white",
    },
  });

const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      type = "text",
      required = false,
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors["shelivery-text-tertiary"]}
          value={value}
          onChangeText={onChange}
          secureTextEntry={type === "password"}
          keyboardType={type === "email" ? "email-address" : "default"}
          autoCapitalize="none"
        />
      </View>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
