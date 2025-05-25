# Shelivery Design System Documentation

## Overview
This document captures the complete design system extracted from the Figma file, including colors, typography, spacing, components, and user flow screens.

## Design Tokens

### Colors
```css
/* Primary Colors */
--primary-yellow: #FFDB0D
--primary-blue: #245B7B
--white: #FFFFFF
--background-gray: #EAE4E4

/* Status Colors */
--error-red: #F04438
--success-green: #12B76A
--warning-orange: #FF9807

/* Text Colors */
--text-primary: #111827
--text-secondary: #374151
--text-tertiary: #6B7280
--text-disabled: #D5D7DA

/* Badge Colors */
--badge-red-bg: #FEF3F2
--badge-red-border: #FFECEE
--badge-red-text: #B42318
--badge-blue-bg: #EFF8FF
--badge-blue-border: #D8F0FE
--badge-blue-text: #175CD3
--badge-green-bg: #ECFDF3
--badge-green-border: #D1FADF
--badge-green-text: #027A48

/* Component Colors */
--button-secondary-bg: #FFF5C0
--button-secondary-border: #FFEF95
--card-background: #FFFADF
--card-border: #E5E8EB
```

### Typography
```css
/* Font Families */
--font-primary: 'Inter'
--font-secondary: 'Poppins'

/* Headings */
--heading-xl: 700 16px/2em Inter
--heading-lg: 700 16px/1.5em Poppins
--heading-md: 600 16px/1.5em Poppins

/* Body Text */
--body-lg: 500 14px/1.43em Poppins
--body-md: 400 14px/1.43em Poppins
--body-sm: 400 12px/1.33em Poppins

/* Buttons */
--button-lg: 600 18px/1.44em Poppins
--button-md: 600 16px/1.5em Poppins
--button-sm: 600 14px/1.43em Inter
--button-xs: 600 12px/1.33em Poppins
```

### Spacing
```css
/* Base Spacing */
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px

/* Component Spacing */
--padding-card: 16px
--padding-page: 24px 16px
--gap-small: 8px
--gap-medium: 16px
--gap-large: 24px
--gap-xl: 32px
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 16px
--radius-lg: 20px
--radius-xl: 30px
--radius-full: 100px
```

### Shadows
```css
--shadow-sm: 0px 1px 2px 0px rgba(10, 13, 18, 0.05)
--shadow-md: 0px 1px 3px 0px rgba(0, 0, 0, 0.1)
--shadow-lg: 0px 2px 4px -2px rgba(10, 13, 18, 0.06), 0px 4px 8px -2px rgba(10, 13, 18, 0.1)
```

## Component Specifications

### 1. System Bar
- **Height**: 47px
- **Content**: Time (9:41), signal strength, wifi, battery
- **Background**: White
- **Padding**: 16px horizontal

### 2. Navigation Bar  
- **Height**: Auto (hug content)
- **Background**: #245B7B
- **Border Radius**: 16px
- **Padding**: 16px
- **Items**: Dashboard (active), Add Basket, Chats
- **Active State**: #FFDB0D background and text

### 3. Basket Cards
- **Background**: #FFFADF
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 16px (small cards), 22px (large cards)
- **Padding**: 8px (small), 16px (large)
- **Shadow**: 0px 1px 3px 0px rgba(0, 0, 0, 0.1)

#### Card Components:
- **Avatar**: 54px diameter with shop images
- **Status Badges**: Small rounded pills with status colors
- **Price Display**: Bold price with "Total: $XX" format

### 4. Progress Bar
- **Height**: 16px
- **Background**: #E5E8EB
- **Border Radius**: 8px
- **Fill Color**: #FF9807 (segments), #FFD907 (current)
- **User Avatars**: 32px positioned above progress points

### 5. Buttons

#### Primary Button
- **Background**: #FFE75B
- **Text**: Black
- **Border Radius**: 16px
- **Padding**: 12px 0px
- **Font**: 600 18px Poppins

#### Secondary Button  
- **Background**: #FFF5C0
- **Border**: 1px solid #FFEF95
- **Text**: #907D17
- **Border Radius**: 8px
- **Padding**: 8px 0px

#### Error Button
- **Background**: #F04438
- **Text**: White
- **Border Radius**: 16px

#### Success Button
- **Background**: #12B76A
- **Text**: White  
- **Border Radius**: 8px

### 6. Status Badges
- **Height**: Auto (hug content)
- **Padding**: 2px 8px
- **Border Radius**: 16px
- **Font**: 500 12px Poppins

#### Badge Variants:
- **Ordering**: Red background (#FEF3F2), red text (#B42318)
- **On the way**: Blue background (#EFF8FF), blue text (#175CD3)  
- **Waiting**: Blue variant
- **Delivered**: Green background (#ECFDF3), green text (#027A48)

### 7. Text Fields
- **Background**: White
- **Border**: 1px solid #6B7280
- **Border Radius**: 18px
- **Padding**: 12px 16px
- **Focus State**: Highlighted border
- **Placeholder**: #AEB4BC

### 8. Modal/Dialog
- **Background**: White
- **Border Radius**: 30px 30px 0px 0px (bottom sheet style)
- **Padding**: 16px
- **Backdrop**: rgba(19, 61, 86, 0.6)

## Screen Layouts

### 1. Dashboard
- **Header**: System bar + page title + share button
- **Content**: 
  - User avatar (80px) with yellow border
  - "Add Basket" card with plus icon
  - "Your Baskets" section with basket cards
- **Footer**: Navigation bar
- **Background**: Gradient from gray to blue

### 2. Ready To Order
- **Header**: Back arrow + "Migros Basket"
- **Content**:
  - Shop avatar (64px)
  - "Ready To Join?" heading
  - Description text
  - Pool progress visualization with user avatars
  - Cost breakdown (coin icon + amounts)
  - Item details link
  - Edit/Delete buttons
- **Footer**: "Ready To Order" button

### 3. Timer Screen (24h Left To Order)
- **Layout**: Similar to Ready To Order
- **Key Difference**: Timer component showing "Time Left: 22h 20m"
- **Timer Design**: Clock icon + countdown text in bordered container
- **Actions**: "Leave Order" link + "Chatroom" button

### 4. Awaiting Delivery
- **Status Message**: "Awaiting Delivery"
- **Description**: "Your order has been placed. Please confirm once it's delivered."
- **Single Action**: "Chatroom" button

### 5. Feedback Modal
- **Design**: Bottom sheet modal
- **Content**: 
  - Illustration (feedback icon)
  - "Share Your Feedback" heading
  - Description text
  - Large text area for feedback
  - "Submit" button

### 6. Delivery Confirmation
- **Question**: "Did you receive your order?"
- **Actions**: Two buttons - "Yes" (green) and "No" (red outline)
- **Layout**: Same card structure as other status screens

## User Flow Progression

```
Dashboard → Ready To Order → Timer Screen → Awaiting Delivery → Delivery Confirmation
                ↓
          Leave Order Modal
                ↓
          Feedback Modal
```

## Interactive Elements

### 1. Pool Progress Animation
- Users represented as avatars along progress bar
- Current user highlighted with larger avatar (40px vs 32px)
- Progress segments fill as pool grows
- Connecting arrows between user positions

### 2. Status Transitions
- Badge colors change based on order status
- Button text and actions update per screen
- Smooth transitions between states

### 3. Navigation States
- Active nav item highlighted in yellow
- Back button functionality on detail screens
- Modal overlay with backdrop blur

## Mobile Considerations

### Screen Dimensions
- **Width**: 375px (iPhone standard)
- **Height**: 800px
- **Safe Areas**: Accounted for in system bar

### Touch Targets
- **Minimum**: 44px height for buttons
- **Recommended**: 48px+ for primary actions
- **Spacing**: 8px minimum between interactive elements

### Typography Scaling
- Font sizes optimized for mobile readability
- Line heights provide comfortable reading
- High contrast ratios for accessibility

This design system provides a complete foundation for implementing the Shelivery MVP with pixel-perfect accuracy to the provided designs.
