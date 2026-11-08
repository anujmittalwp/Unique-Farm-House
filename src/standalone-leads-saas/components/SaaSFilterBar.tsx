import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  LayoutList, 
  Kanban,
  UserCheck
} from 'lucide-react';
import { DashboardFilters, TenantUser } from '../types';

interface Props {
  filters: DashboardFilters;
  onFilterChange: (updates: Partial<DashboardFilters>) => void;
  onResetFilters: () => void;
  teamMembers: TenantUser[];
  viewMode: 'table' | 'pipeline';
  onViewModeChange: (mode: 'table' | 'pipeline') => void;
  totalFilteredCount: number;
}

export const SaaSFilterBar: React.FC<Props> = ({
  filters,
  onFilterChange,
  onResetFilters,
  teamMembers,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.source !== 'all' ||
    filters.agent !== 'all';

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-luxury-dark/10 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by lead name, phone, email, city, occasion..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-luxury-dark/30 rounded-xl outline-none transition-all"
          />
          {filters.search && (
            <button 
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Center: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none hover:border-luxury-dark/30 cursor-pointer font-medium"
          >
            <option value="all">Status: All</option>
            <option value="new">🆕 New</option>
            <option value="contacted">📞 Contacted</option>
            <option value="quotation_sent">📑 Quotation Sent</option>
            <option value="hot">🔥 Hot / In Negotiation</option>
            <option value="converted">🏆 Converted / Won</option>
            <option value="lost">❌ Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none hover:border-luxury-dark/30 cursor-pointer font-medium"
          >
            <option value="all">Priority: All</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Source Filter */}
          <select
            value={filters.source}
            onChange={(e) => onFilterChange({ source: e.target.value })}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none hover:border-luxury-dark/30 cursor-pointer font-medium"
          >
            <option value="all">Source: All</option>
            <option value="Direct Website">Direct Website</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Meta Instagram">Meta Instagram</option>
            <option value="Referral">Referral</option>
            <option value="OTA">OTA / Channel</option>
          </select>

          {/* Assigned Agent Filter */}
          <select
            value={filters.agent}
            onChange={(e) => onFilterChange({ agent: e.target.value })}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none hover:border-luxury-dark/30 cursor-pointer font-medium"
          >
            <option value="all">Agent: All Team</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.name}>
                👤 {m.name} ({m.role})
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all filters"
              className="p-2 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-xl flex items-center gap-1 transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Right: View Mode Toggle & Count Badge */}
        <div className="flex items-center gap-3 justify-end shrink-0">
          <div className="text-xs font-medium text-gray-500">
            Showing <span className="font-bold text-luxury-dark">{totalFilteredCount}</span> leads
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-luxury-dark shadow-sm'
                  : 'text-gray-500 hover:text-luxury-dark'
              }`}
            >
              <LayoutList size={14} />
              <span>Table</span>
            </button>

            <button
              onClick={() => onViewModeChange('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'pipeline'
                  ? 'bg-white text-luxury-dark shadow-sm'
                  : 'text-gray-500 hover:text-luxury-dark'
              }`}
            >
              <Kanban size={14} />
              <span>Pipeline</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
