import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

interface Holiday {
  dateRange: string;
  name: string;
}

interface BookingCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
  excludeDates: Date[];
  dayClassName?: (date: Date) => string | undefined;
  holidays?: Holiday[];
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  startDate,
  endDate,
  onChange,
  excludeDates,
  dayClassName,
  holidays,
}) => {
  return (
    <div className="relative">
      <DatePicker
        selectsRange
        monthsShown={2}
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        minDate={new Date()}
        excludeDates={excludeDates}
        dayClassName={(date) => {
          const isExcluded = excludeDates.some(d => d.toDateString() === date.toDateString());
          const baseClass = dayClassName ? dayClassName(date) : '';
          return `${baseClass} ${isExcluded ? 'react-datepicker__day--excluded' : ''}`;
        }}
        popperContainer={({ children }) => (
          <div className="bg-white p-4 rounded-xl shadow-lg border border-black/5 z-50">
            {children}
            {holidays && holidays.length > 0 && (
              <div className="mt-4 pt-4 border-t border-black/5 text-xs text-luxury-dark/60 grid grid-cols-2 gap-2">
                {holidays.map((h, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
                    <span><span className="font-bold">{h.dateRange}</span> {h.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        placeholderText="Check-in - Check-out"
        className="w-full px-4 py-4 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm"
        dateFormat="dd/MM/yyyy"
      />
      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20 pointer-events-none" size={16} />
    </div>
  );
};
