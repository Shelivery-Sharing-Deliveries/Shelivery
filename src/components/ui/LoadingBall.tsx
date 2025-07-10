    import React from 'react';

    // Define the props for the LoadingBall component
    interface LoadingBallProps {
      /**
       * The size of each bouncing ball.
       * Can be 'small', 'medium', or 'large'.
       * Defaults to 'medium'.
       */
      size?: 'small' | 'medium' | 'large';
      /**
       * The color of the bouncing balls.
       * Uses Tailwind CSS color classes (e.g., 'blue-500', 'shelivery-primary-yellow').
       * Defaults to 'shelivery-primary-yellow'.
       */
      color?: string;
      /**
       * Additional Tailwind CSS classes to apply to the main container.
       */
      className?: string;
    }

    /**
     * A reusable React component for displaying a bouncing ball loading indicator.
     * It uses Tailwind CSS for styling and animation to create a "loading ball" effect.
     *
     * @param {LoadingBallProps} props - The props for the component.
     * @returns {JSX.Element} The bouncing ball loading indicator component.
     */
    const LoadingBall: React.FC<LoadingBallProps> = ({
      size = 'medium',
      color = 'shelivery-primary-yellow', // Changed default to a Shelivery color
      className = '',
    }) => {
      // Determine the Tailwind CSS classes for ball size based on the size prop
      const ballSizeClasses = {
        small: 'h-2 w-2',
        medium: 'h-3 w-3',
        large: 'h-4 w-4',
      }[size];

      // The animation class for the bouncing effect
      const bounceAnimationClass = 'animate-bounce';

      return (
        <div
          className={`
            flex items-center justify-center space-x-2
            ${className}
          `}
          role="status" // ARIA role for accessibility
          aria-label="Loading" // ARIA label for screen readers
        >
          {/* First bouncing ball */}
          <div
            className={`
              ${ballSizeClasses}
              bg-${color}
              rounded-full
              ${bounceAnimationClass}
              [animation-delay:-0.3s]
            `}
          ></div>
          {/* Second bouncing ball */}
          <div
            className={`
              ${ballSizeClasses}
              bg-${color}
              rounded-full
              ${bounceAnimationClass}
              [animation-delay:-0.15s]
            `}
          ></div>
          {/* Third bouncing ball */}
          <div
            className={`
              ${ballSizeClasses}
              bg-${color}
              rounded-full
              ${bounceAnimationClass}
            `}
          ></div>
          {/* Visually hidden span for screen readers to announce loading status */}
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      );
    };

    export default LoadingBall;
    