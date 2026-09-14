export interface QuickAction {
  iconName: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
  path: string;
}

export interface QuickStart {
  iconName: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
  path: string;
}

export interface DashboardData {
  quickActions: QuickAction[];
  quickStarts: QuickStart[];
}

export const HOME_CONFIG: DashboardData = {
  quickActions: [
    { iconName: 'Search', title: 'Ask a Question', desc: 'Get quick and accurate answers', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', path: '/ask' },
    { iconName: 'FileText', title: 'Analyze Document', desc: 'Upload and extract insights', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', path: '/files' },
    { iconName: 'PenTool', title: 'Write Content', desc: 'Create, edit and improve', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', path: '/ask' },
    { iconName: 'Globe', title: 'Research', desc: 'Get latest information from the web', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', path: '/ask' },
    { iconName: 'LayoutGrid', title: 'Compare Models', desc: 'See multiple AI responses side by side', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', path: '/compare' },
  ],
  quickStarts: [
    { iconName: 'Box', title: 'Compare responses', desc: 'See where models agree or differ', color: 'text-blue-500', bg: 'bg-blue-100', path: '/compare' },
    { iconName: 'CheckCircle', title: 'Verify an answer', desc: 'Check for errors or missing info', color: 'text-orange-500', bg: 'bg-orange-100', path: '/verify' },
    { iconName: 'FileText', title: 'Upload a file', desc: 'Get insights from your documents', color: 'text-emerald-500', bg: 'bg-emerald-100', path: '/files' },
    { iconName: 'Globe', title: 'Explore with web', desc: 'Use current information', color: 'text-blue-500', bg: 'bg-blue-100', path: '/ask' },
  ]
};
