import type { ReactNode } from 'react';

interface ResponsivePageHeaderProps {
  title: string;
  action?: ReactNode;
  testId?: string;
  className?: string;
}

export function ResponsivePageHeader({ title, action, testId, className = '' }: ResponsivePageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 ${className}`}>
      <h1 className="text-heading font-bold text-center md:text-left" data-testid={testId}>
        {title}
      </h1>
      {action && <div className="w-full md:w-auto">{action}</div>}
    </div>
  );
}

interface ResponsiveSectionHeaderProps {
  title: string;
  action?: ReactNode;
  testId?: string;
  className?: string;
}

export function ResponsiveSectionHeader({ title, action, testId, className = '' }: ResponsiveSectionHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 ${className}`}>
      <h2 className="text-subheading font-bold text-center md:text-left" data-testid={testId}>
        {title}
      </h2>
      {action && <div className="w-full md:w-auto flex-shrink-0">{action}</div>}
    </div>
  );
}
