import { Home, MessageSquare, LayoutGrid, CheckCircle, FileText, Clock, Settings } from 'lucide-react';

export const mainNavLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Ask', href: '/ask', icon: MessageSquare },
  { name: 'Compare', href: '/compare', icon: LayoutGrid },
  { name: 'Verify', href: '/verify', icon: CheckCircle },
  { name: 'Files', href: '/files', icon: FileText },
];

export const secondaryNavLinks = [
  { name: 'History', href: '/history', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
];
