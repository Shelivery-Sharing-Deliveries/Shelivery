import React from 'react';
import { Button as TamaguiButton, styled } from 'tamagui';

// Create styled button variants using Tamagui
export const SheliveryButton = styled(TamaguiButton, {
  name: 'SheliveryButton',
  
  variants: {
    // Custom variant property
    buttonVariant: {
      primary: {
        backgroundColor: '$shelivery-primary-yellow',
        borderWidth: 0,
        color: '$shelivery-text-primary',
        
        hoverStyle: {
          backgroundColor: '#FFE766',
        },
        
        pressStyle: {
          backgroundColor: '#FFD700',
        },
      },
      
      secondary: {
        backgroundColor: '$shelivery-button-secondary-bg',
        borderWidth: 1,
        borderColor: '$shelivery-button-secondary-border',
        color: '$shelivery-text-primary',
        
        hoverStyle: {
          backgroundColor: '#FFEF95',
          borderColor: '#FFE766',
        },
        
        pressStyle: {
          backgroundColor: '#FFE766',
          borderColor: '#FFD700',
        },
      },
      
      error: {
        backgroundColor: '$shelivery-error-red',
        borderWidth: 0,
        color: '$white',
        
        hoverStyle: {
          backgroundColor: '#FF5252',
        },
        
        pressStyle: {
          backgroundColor: '#FF3333',
        },
      },
      
      success: {
        backgroundColor: '$shelivery-success-green',
        borderWidth: 0,
        color: '$white',
        
        hoverStyle: {
          backgroundColor: '#4CD964',
        },
        
        pressStyle: {
          backgroundColor: '#2ECC71',
        },
      },
    },
    
    buttonSize: {
      sm: {
        padding: '$2',
        fontSize: '$1',
        borderRadius: '$2',
      },
      
      md: {
        padding: '$3',
        fontSize: '$2',
        borderRadius: '$2',
      },
      
      lg: {
        padding: '$4',
        fontSize: '$3',
        borderRadius: '$3',
      },
    },
    
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
    
    loading: {
      true: {
        opacity: 0.7,
        pointerEvents: 'none',
      },
    },
  } as const,
  
  defaultVariants: {
    buttonVariant: 'primary',
    buttonSize: 'md',
  },
});

// Props interface
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

// Main Button component
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onPress,
  style,
  ...props
}) => {
  return (
    <SheliveryButton
      buttonVariant={variant}
      buttonSize={size}
      disabled={disabled || loading}
      loading={loading}
      onPress={onPress}
      style={style}
      {...props}
    >
      {children}
    </SheliveryButton>
  );
};

export default Button;
