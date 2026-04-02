import { getNavIconName, IconSymbolName } from "../components/ui";

export interface NavItem {
  name: string;
  route: string;
  iconName: IconSymbolName;
}

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    route: "dashboard",
    iconName: getNavIconName("dashboard"),
  },
  {
    name: "Stores",
    route: "stores",
    iconName: getNavIconName("stores"),
  },
  {
    name: "Chatrooms",
    route: "chatrooms",
    iconName: getNavIconName("chatrooms"),
  },
];