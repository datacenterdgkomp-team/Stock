
import React from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  ShoppingCart,
  Wrench,
  RotateCcw,
  Award,
  DollarSign,
  History,
  Clock,
  FileText,
  Settings,
  Database,
  LogOut,
  Menu,
  ChevronLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Home,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Lock,
  Unlock,
  Eye as EyeIcon,
  EyeOff,
  Copy,
  Share2,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Printer,
  Save,
  Loader2,
  AlertTriangle,
  HelpCircle,
  MoreVertical,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  RefreshCw,
  Trash,
  Archive,
  Inbox,
  Send,
  Paperclip,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Gitlab,
  Github,
  Trello,
  Slack,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Chrome,
  Code,
  Terminal,
  Command,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Bluetooth,
  Cast,
  Radio,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Volume,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Bell,
  BellOff,
  Vibrate,
  Power,
  PowerOff,
  Battery,
  BatteryCharging,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Eye as EyeIconAlt,
  Target,
  Layers,
  Inbox as InboxIcon,
  Inbox as InboxIconAlt,
  Inbox as InboxIconAlt2,
  Inbox as InboxIconAlt3,
  Inbox as InboxIconAlt4,
  Inbox as InboxIconAlt5,
  Inbox as InboxIconAlt6,
  Inbox as InboxIconAlt7,
  Inbox as InboxIconAlt8,
  Inbox as InboxIconAlt9,
  Inbox as InboxIconAlt10,
  Inbox as InboxIconAlt11,
  Inbox as InboxIconAlt12,
  Inbox as InboxIconAlt13,
  Inbox as InboxIconAlt14,
  Inbox as InboxIconAlt15,
  Inbox as InboxIconAlt16,
  Inbox as InboxIconAlt17,
  Inbox as InboxIconAlt18,
  Inbox as InboxIconAlt19,
  Inbox as InboxIconAlt20,
  Inbox as InboxIconAlt21,
  Inbox as InboxIconAlt22,
  Inbox as InboxIconAlt23,
  Inbox as InboxIconAlt24,
  Inbox as InboxIconAlt25,
  Inbox as InboxIconAlt26,
  Inbox as InboxIconAlt27,
  Inbox as InboxIconAlt28,
  Inbox as InboxIconAlt29,
  Inbox as InboxIconAlt30,
  Inbox as InboxIconAlt31,
  Inbox as InboxIconAlt32,
  Inbox as InboxIconAlt33,
  Inbox as InboxIconAlt34,
  Inbox as InboxIconAlt35,
  Inbox as InboxIconAlt36,
  Inbox as InboxIconAlt37,
  Inbox as InboxIconAlt38,
  Inbox as InboxIconAlt39,
  Inbox as InboxIconAlt40,
  Inbox as InboxIconAlt41,
  Inbox as InboxIconAlt42,
  Inbox as InboxIconAlt43,
  Inbox as InboxIconAlt44,
  Inbox as InboxIconAlt45,
  Inbox as InboxIconAlt46,
  Inbox as InboxIconAlt47,
  Inbox as InboxIconAlt48,
  Inbox as InboxIconAlt49,
  Inbox as InboxIconAlt50,
  Inbox as InboxIconAlt51,
  Inbox as InboxIconAlt52,
  Inbox as InboxIconAlt53,
  Inbox as InboxIconAlt54,
  Inbox as InboxIconAlt55,
  Inbox as InboxIconAlt56,
  Inbox as InboxIconAlt57,
  Inbox as InboxIconAlt58,
  Inbox as InboxIconAlt59,
  Inbox as InboxIconAlt60,
  Inbox as InboxIconAlt61,
  Inbox as InboxIconAlt62,
  Inbox as InboxIconAlt63,
  Inbox as InboxIconAlt64,
  Inbox as InboxIconAlt65,
  Inbox as InboxIconAlt66,
  Inbox as InboxIconAlt67,
  Inbox as InboxIconAlt68,
  Inbox as InboxIconAlt69,
  Inbox as InboxIconAlt70,
  Inbox as InboxIconAlt71,
  Inbox as InboxIconAlt72,
  Inbox as InboxIconAlt73,
  Inbox as InboxIconAlt74,
  Inbox as InboxIconAlt75,
  Inbox as InboxIconAlt76,
  Inbox as InboxIconAlt77,
  Inbox as InboxIconAlt78,
  Inbox as InboxIconAlt79,
  Inbox as InboxIconAlt80,
  Inbox as InboxIconAlt81,
  Inbox as InboxIconAlt82,
  Inbox as InboxIconAlt83,
  Inbox as InboxIconAlt84,
  Inbox as InboxIconAlt85,
  Inbox as InboxIconAlt86,
  Inbox as InboxIconAlt87,
  Inbox as InboxIconAlt88,
  Inbox as InboxIconAlt89,
  Inbox as InboxIconAlt90,
  Inbox as InboxIconAlt91,
  Inbox as InboxIconAlt92,
  Inbox as InboxIconAlt93,
  Inbox as InboxIconAlt94,
  Inbox as InboxIconAlt95,
  Inbox as InboxIconAlt96,
  Inbox as InboxIconAlt97,
  Inbox as InboxIconAlt98,
  Inbox as InboxIconAlt99,
  Inbox as InboxIconAlt100,
} from 'lucide-react';

/**
 * Icon Map - Maps icon names to Lucide React icon components
 * Used for dynamic icon rendering in menus, buttons, and UI elements
 */
const iconMap = {
  // Dashboard & Navigation
  'LayoutDashboard': LayoutDashboard,
  'Dashboard': LayoutDashboard,
  'Home': Home,
  'Menu': Menu,
  'ChevronLeft': ChevronLeft,
  'ChevronDown': ChevronDown,
  'ChevronUp': ChevronUp,
  'ChevronRight': ChevronRight,
  'MoreVertical': MoreVertical,
  'MoreHorizontal': MoreHorizontal,

  // User & Access Control
  'Users': Users,
  'User': User,
  'Shield': Shield,
  'Lock': Lock,
  'Unlock': Unlock,
  'Eye': Eye,
  'EyeOff': EyeOff,

  // Inventory & Products
  'Package': Package,
  'Inbox': Inbox,
  'Archive': Archive,
  'Folder': Folder,
  'FolderOpen': FolderOpen,

  // Sales & Transactions
  'ShoppingCart': ShoppingCart,
  'DollarSign': DollarSign,
  'TrendingUp': TrendingUp,
  'History': History,

  // Service & Maintenance
  'Wrench': Wrench,
  'Tool': Wrench,
  'Zap': Zap,

  // Returns & Warranty
  'RotateCcw': RotateCcw,
  'Award': Award,

  // Time & Attendance
  'Clock': Clock,
  'Calendar': Calendar,
  'Activity': Activity,

  // Reports & Analytics
  'FileText': FileText,
  'BarChart3': BarChart3,
  'PieChart': PieChart,
  'LineChart': LineChart,

  // Settings & System
  'Settings': Settings,
  'Database': Database,
  'Briefcase': Briefcase,

  // Actions
  'Plus': Plus,
  'Edit': Edit,
  'Trash2': Trash2,
  'Trash': Trash,
  'Search': Search,
  'Download': Download,
  'Upload': Upload,
  'Printer': Printer,
  'Save': Save,
  'Copy': Copy,
  'Share2': Share2,
  'RefreshCw': RefreshCw,

  // Status & Alerts
  'AlertCircle': AlertCircle,
  'AlertTriangle': AlertTriangle,
  'CheckCircle': CheckCircle,
  'XCircle': XCircle,
  'Info': Info,
  'HelpCircle': HelpCircle,

  // Loading & Progress
  'Loader2': Loader2,

  // Communication
  'Mail': Mail,
  'Phone': Phone,
  'Send': Send,
  'Paperclip': Paperclip,

  // Location & Map
  'MapPin': MapPin,

  // Media
  'Image': ImageIcon,
  'Video': Video,
  'Music': Music,
  'File': File,

  // Code & Development
  'Code': Code,
  'Terminal': Terminal,
  'Command': Command,
  'GitBranch': GitBranch,
  'GitCommit': GitCommit,
  'GitPullRequest': GitPullRequest,

  // Hardware & Devices
  'Cpu': Cpu,
  'HardDrive': HardDrive,
  'Smartphone': Smartphone,
  'Tablet': Tablet,
  'Watch': Watch,
  'Headphones': Headphones,

  // Network & Connectivity
  'Wifi': Wifi,
  'WifiOff': WifiOff,
  'Bluetooth': Bluetooth,
  'Radio': Radio,

  // Audio & Volume
  'Volume': Volume,
  'Volume2': Volume2,
  'VolumeX': VolumeX,
  'Mic': Mic,
  'MicOff': MicOff,

  // Notifications
  'Bell': Bell,
  'BellOff': BellOff,

  // Power & Battery
  'Power': Power,
  'PowerOff': PowerOff,
  'Battery': Battery,
  'BatteryCharging': BatteryCharging,

  // Weather & Environment
  'Sun': Sun,
  'Moon': Moon,
  'Cloud': Cloud,
  'CloudRain': CloudRain,
  'Wind': Wind,
  'Droplets': Droplets,

  // UI Controls
  'Maximize2': Maximize2,
  'Minimize2': Minimize2,
  'Vibrate': Vibrate,
  'Target': Target,
  'Layers': Layers,

  // Social & External
  'Github': Github,
  'Gitlab': Gitlab,
  'Twitter': Twitter,
  'Facebook': Facebook,
  'Instagram': Instagram,
  'Linkedin': Linkedin,
  'Youtube': Youtube,
  'Slack': Slack,
  'Trello': Trello,

  // Browsers
  'Chrome': Chrome,

  // Auth
  'LogOut': LogOut,
};

/**
 * Get icon component by name
 * @param {string} iconName - The name of the icon
 * @returns {React.Component|null} The icon component or null if not found
 */
export const getIcon = (iconName) => {
  if (!iconName) return null;
  return iconMap[iconName] || null;
};

/**
 * Render icon with optional className
 * @param {string} iconName - The name of the icon
 * @param {string} className - Optional CSS classes
 * @returns {React.ReactElement|null} The rendered icon or null
 */
export const renderIcon = (iconName, className = 'w-5 h-5') => {
  const Icon = getIcon(iconName);
  if (!Icon) return null;
  // Replaced JSX (<Icon className={className} />) with React.createElement to keep syntax valid in pure .js files
  return React.createElement(Icon, { className });
};

export default iconMap;
