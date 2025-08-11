'use client';

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, subtitle, children }: TopBarProps) {
  return (
    <div className="sticky top-0 left-0 right-0 flex justify-between items-center mb-8 px-6 py-4 bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b border-gray-200 rounded-lg z-20 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}