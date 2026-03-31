// Icon component for Shelivery mobile app using Lucide React Native
// Modern, consistent design with beautiful icons

import * as LucideIcons from 'lucide-react-native';
import { type StyleProp, type ViewStyle } from 'react-native';

// Type for available Lucide icon names
export type IconSymbolName = keyof typeof iconComponents;

// Create a mapping object for all Lucide icons
const iconComponents = {
  // Navigation icons
  'house.fill': LucideIcons.Home,
  'bag.fill': LucideIcons.ShoppingBag,
  'message.fill': LucideIcons.MessageCircle,
  'person.fill': LucideIcons.User,
  'settings.fill': LucideIcons.Settings,
  
  // Action icons
  'plus.circle.fill': LucideIcons.PlusCircle,
  'arrow.left': LucideIcons.ArrowLeft,
  'chevron.right': LucideIcons.ChevronRight,
  'xmark.circle.fill': LucideIcons.XCircle,
  'checkmark.circle.fill': LucideIcons.CheckCircle,
  
  // Feature icons
  'cart.fill': LucideIcons.ShoppingCart,
  'clock.fill': LucideIcons.Clock,
  'location.fill': LucideIcons.MapPin,
  'creditcard.fill': LucideIcons.CreditCard,
  'bell.fill': LucideIcons.Bell,
  
  // Status icons
  'exclamationmark.circle.fill': LucideIcons.AlertCircle,
  'checkmark.circle': LucideIcons.CheckCircle,
  'info.circle.fill': LucideIcons.Info,
  'warning.fill': LucideIcons.AlertTriangle,
  
  // Additional useful icons
  'search': LucideIcons.Search,
  'filter': LucideIcons.Filter,
  'heart': LucideIcons.Heart,
  'star': LucideIcons.Star,
  'share': LucideIcons.Share2,
  'download': LucideIcons.Download,
  'upload': LucideIcons.Upload,
  'edit': LucideIcons.Edit,
  'trash': LucideIcons.Trash2,
  'menu': LucideIcons.Menu,
  'more': LucideIcons.MoreVertical,
  'logout': LucideIcons.LogOut,
  'login': LucideIcons.LogIn,
  'user.plus': LucideIcons.UserPlus,
  'users': LucideIcons.Users,
  'calendar': LucideIcons.Calendar,
  'tag': LucideIcons.Tag,
  'package': LucideIcons.Package,
  'truck': LucideIcons.Truck,
  'dollar': LucideIcons.DollarSign,
  'percent': LucideIcons.Percent,
  'phone': LucideIcons.Phone,
  'mail': LucideIcons.Mail,
  'lock': LucideIcons.Lock,
  'unlock': LucideIcons.Unlock,
  'eye': LucideIcons.Eye,
  'eye.off': LucideIcons.EyeOff,
  'camera': LucideIcons.Camera,
  'image': LucideIcons.Image,
  'file': LucideIcons.File,
  'folder': LucideIcons.Folder,
  'database': LucideIcons.Database,
  'server': LucideIcons.Server,
  'wifi': LucideIcons.Wifi,
  'battery': LucideIcons.Battery,
  'bluetooth': LucideIcons.Bluetooth,
  'wifi.off': LucideIcons.WifiOff,
  'cloud': LucideIcons.Cloud,
  'sun': LucideIcons.Sun,
  'moon': LucideIcons.Moon,
  'weather': LucideIcons.CloudSun,
} as const;

/**
 * An icon component that uses Lucide React Native icons.
 * Modern, consistent design with beautiful stroke-based icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color = 'currentColor',
  style,
  strokeWidth = 2,
}: {
  name: IconSymbolName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
}) {
  const IconComponent = iconComponents[name] || LucideIcons.HelpCircle;
  
  return (
    <IconComponent 
      color={color} 
      size={size} 
      strokeWidth={strokeWidth}
      style={style} 
    />
  );
}

// Helper function to get icon name for navigation items
export function getNavIconName(route: string): IconSymbolName {
  switch (route) {
    case 'dashboard':
      return 'house.fill';
    case 'stores':
      return 'bag.fill';
    case 'chatrooms':
      return 'message.fill';
    case 'profile':
      return 'person.fill';
    case 'settings':
      return 'settings.fill';
    default:
      return 'house.fill';
  }
}

// Export individual icons for direct use if needed
export const Icons = iconComponents;

export default IconSymbol;