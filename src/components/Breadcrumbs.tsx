import React from 'react';
import { NavTab, BreadcrumbItem } from '../types';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (tab: NavTab) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="flex items-center text-xs text-slate-500 py-3 mb-4 overflow-x-auto no-scrollbar font-sans"
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {/* Root Home */}
        <li className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 text-slate-500 hover:text-[#164E3D] transition-colors cursor-pointer"
            title="Go to Homepage"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              {isLast || !item.tab ? (
                <span
                  className="font-semibold text-[#164E3D] truncate max-w-[280px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.tab!)}
                  className="text-slate-500 hover:text-[#164E3D] transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
