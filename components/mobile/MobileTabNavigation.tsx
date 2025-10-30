'use client';

import { useAppStore } from '@/lib/store';
import { Home, Search, BarChart3 } from 'lucide-react';

export function MobileTabNavigation() {
  const { activeMobileTab, setActiveMobileTab } = useAppStore();

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'analysis', icon: BarChart3, label: 'Analysis' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMobileTab(tab.id)}
            className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors ${
              activeMobileTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}