import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  // Renk şeması (Dinamik olarak renk değişimi için)
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <div className="bg-siem-card border border-siem-border rounded-xl p-5 hover:border-siem-accent/30 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${selectedColor}`}>
          <Icon size={20} />
        </div>
      </div>
      
      {/* Trend Göstergesi */}
      <div className="mt-4 flex items-center text-xs">
        {trend === 'up' ? (
          <span className="text-red-400 flex items-center font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            {trendValue}
          </span>
        ) : (
          <span className="text-emerald-400 flex items-center font-medium">
            <ArrowDownRight size={14} className="mr-1" />
            {trendValue}
          </span>
        )}
        <span className="text-gray-500 ml-2">geçen saate göre</span>
      </div>
    </div>
  );
};

export default StatCard;