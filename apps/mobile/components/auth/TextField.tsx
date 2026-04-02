import { forwardRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";

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
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors['shelivery-text-secondary']}
          value={value}
          onChangeText={onChange}
          secureTextEntry={type === 'password'}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          autoCapitalize="none"
        />
      </View>
    );
  }
);

TextField.displayName = "TextField";

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#252B37',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9EAEB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#252B37',
  },
});

export default TextField;
