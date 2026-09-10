import { Atom, Code2, TrendingUp, Target } from 'lucide-react';

export const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { Atom, Code2, TrendingUp, Target };
  return icons[iconName] || Atom;
};
