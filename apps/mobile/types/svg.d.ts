/**
 * TypeScript declaration for SVG imports.
 * react-native-svg-transformer converts .svg files into React Native
 * SVG components, so they must be imported and rendered as components,
 * not as Image sources.
 */
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
