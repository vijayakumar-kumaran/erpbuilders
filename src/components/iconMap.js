// src/components/iconMap.js
import {
  Home,
  User,
  ScanEye,
  PackageOpen,
  ShoppingCart,
  Edit2,
  FileText,
  CheckCircle,
  Layers,
  Warehouse,
  Database,
  Truck,
  ArrowRightLeft,
  RotateCcw,
  Globe,
  BrickWall,
  Tag,
  HelpCircle,
  LogOut,
  MenuSquare,
  Boxes,
  Settings,
  PieChart,
  List,
  ClipboardList,
  BarChart2
} from 'lucide-react';

const iconMap = {
  // Main
  'home': Home,
  'user': User,
  'scan-eye': ScanEye,
  'package-open': PackageOpen,
  
  // Operations
  'shopping-cart': ShoppingCart,
  'edit-2': Edit2,
  'file-text': FileText,
  'check-circle': CheckCircle,
  'layers': Layers,
  
  // Transactions
  'warehouse': Warehouse,
  'database': Database,
  'truck': Truck,
  'arrow-right-left': ArrowRightLeft,
  'rotate-ccw': RotateCcw,
  
  // Reports
  'pie-chart': PieChart,
  'bar-chart-2': BarChart2,
  'clipboard-list': ClipboardList,
  
  // Masters
  'globe': Globe,
  'brick-wall': BrickWall,
  'tag': Tag,
  'list': List,
  
  // Secondary
  'help-circle': HelpCircle,
  'log-out': LogOut,
  'menu-square': MenuSquare,
  'boxes': Boxes,
  'settings': Settings,
  
  // Aliases for specific route names
  'Dashboard': Home,
  'Account Center': User,
  'Track / View': ScanEye,
  'Opening Stock': PackageOpen,
  'Material Request': ShoppingCart,
  'View/Edit Request': Edit2,
  'Create Material Request PO': FileText,
  'PO Approval (Material)': CheckCircle,
  'Material Additional Input': Layers,
  'Purchase Order': FileText,
  'Material Receipt Entry': Warehouse,
  'Material Account Entry': Database,
  'Material Issue to Site': Truck,
  'Stock Transfer Entry': ArrowRightLeft,
  'Material Return': RotateCcw,
  'Stock Report By Location': Warehouse,
  'Material Issue Report': Warehouse,
  'Po Status Report': Warehouse,
  'Sources': Globe,
  'Sites': Warehouse,
  'Material Master': BrickWall,
  'Work Stages': Layers,
  'Vendor': Tag,
  'Vendor Rate Master': Tag,
  'Help Center': HelpCircle,
  'Logout': LogOut,
  'Menu Manager': MenuSquare,
  'Menu Role Manager': Boxes,
  'Settings': Settings
};

export default iconMap;s