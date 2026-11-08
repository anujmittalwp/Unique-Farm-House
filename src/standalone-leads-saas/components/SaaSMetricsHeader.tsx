import React from 'react';
import { 
  Users, 
  Flame, 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import { DashboardMetrics } from '../types';

interface Props {
  metrics: DashboardMetrics;
  onFilterClick?: (filterKey: string) => void;
}

export const SaaSMetricsHeader: React.FC<Props> = ({ metrics, onFilterClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Leads */}
      <div 
        onClick={() => onFilterClick && onFilterClick('all')}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-luxury-dark/10 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-luxury-dark/50 group-hover:text-luxury-dark transition-colors">
            Total Pipeline
          </span>
          <div className="w-8 h-8 rounded-xl bg-luxury-dark/5 flex items-center justify-center text-luxury-dark group-hover:bg-luxury-dark group-hover:text-white transition-all">
            <Users size={16} />
          </div>
        </div>
        <div className="text-2xl font-serif font-black text-luxury-dark">
          {metrics.totalLeads}
        </div>
        <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
          <span className="font-semibold text-blue-600">{metrics.newLeads}</span> new captured
        </div>
      </div>

      {/* 2. Hot Leads */}
      <div 
        onClick={() => onFilterClick && onFilterClick('hot')}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700/60 group-hover:text-amber-800 transition-colors">
            Hot & High Pri
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
            <Flame size={16} />
          </div>
        </div>
        <div className="text-2xl font-serif font-black text-amber-600">
          {metrics.hotLeads}
        </div>
        <div className="text-[10px] text-amber-700/80 mt-1 font-medium">
          Ready for booking
        </div>
      </div>

      {/* 3. Today's Follow-ups */}
      <div 
        onClick={() => onFilterClick && onFilterClick('today_followup')}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      >
        {metrics.todayFollowUps > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700/60 group-hover:text-indigo-800 transition-colors">
            Today Follow-up
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <CalendarClock size={16} />
          </div>
        </div>
        <div className="text-2xl font-serif font-black text-indigo-700">
          {metrics.todayFollowUps}
        </div>
        <div className="text-[10px] text-indigo-600/80 mt-1 font-medium">
          Scheduled calls today
        </div>
      </div>

      {/* 4. Overdue Follow-ups */}
      <div 
        onClick={() => onFilterClick && onFilterClick('overdue')}
        className={`bg-white/90 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer group ${
          metrics.overdueFollowUps > 0 ? 'border-red-500/30 bg-red-50/20' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600/70 group-hover:text-red-700 transition-colors">
            Overdue Follow-up
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className={`text-2xl font-serif font-black ${metrics.overdueFollowUps > 0 ? 'text-red-600' : 'text-gray-400'}`}>
          {metrics.overdueFollowUps}
        </div>
        <div className="text-[10px] text-red-600/80 mt-1 font-medium">
          Requires urgent call
        </div>
      </div>

      {/* 5. Won / Converted */}
      <div 
        onClick={() => onFilterClick && onFilterClick('won')}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700/60 group-hover:text-emerald-800 transition-colors">
            Won / Converted
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="text-2xl font-serif font-black text-emerald-600">
          {metrics.convertedLeads}
        </div>
        <div className="text-[10px] text-emerald-700/80 mt-1 font-medium">
          Tokens & Bookings confirmed
        </div>
      </div>

      {/* 6. Win Rate */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-luxury-dark/10 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-luxury-dark/50">
            Conversion Rate
          </span>
          <div className="w-8 h-8 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="text-2xl font-serif font-black text-luxury-dark">
          {metrics.conversionRate}%
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, metrics.conversionRate)}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
