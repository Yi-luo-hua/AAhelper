
import React from 'react';
import { IndividualExpense } from '../types';

interface SummaryPanelProps {
  totalBill: number;
  people: string[];
  expenses: IndividualExpense[];
  onTotalChange: (val: number) => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ totalBill, people, expenses, onTotalChange }) => {
  
  // Algorithm: AA Split
  // 1. Sum of individual expenses
  const totalIndividualCost = expenses.reduce((acc, e) => acc + e.cost, 0);
  
  // 2. Remaining Shared Pool
  const sharedPool = Math.max(0, totalBill - totalIndividualCost);
  
  // 3. Share per person
  const peopleCount = people.length || 1;
  const baseShare = sharedPool / peopleCount;

  // 4. Calculate per-person total
  const result = people.map(person => {
    const myExpenses = expenses.filter(e => e.person.toLowerCase() === person.toLowerCase());
    const myIndividualCost = myExpenses.reduce((acc, e) => acc + e.cost, 0);
    return {
      name: person,
      baseShare: baseShare,
      individual: myIndividualCost,
      total: baseShare + myIndividualCost
    };
  });

  return (
    <div className="h-full bg-white border-2 border-slate-800 paper-shadow rounded-sm p-6 flex flex-col gap-6 relative overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b-2 border-dashed border-slate-300 pb-6 flex-shrink-0">
        <div className="flex justify-between items-end">
          <label className="font-serif text-xl text-slate-600 italic">账单总额</label>
          <div className="flex items-baseline">
             <span className="text-2xl font-serif mr-1">¥</span>
             <input 
               type="number" 
               value={totalBill || ''} 
               onChange={(e) => onTotalChange(parseFloat(e.target.value) || 0)}
               placeholder="0.00"
               className="w-32 text-right text-4xl font-mono font-bold text-slate-900 bg-transparent border-b-2 border-slate-800 focus:outline-none focus:border-indigo-600"
             />
          </div>
        </div>

        <div className="flex justify-between text-sm font-mono text-slate-500">
            <span>- 单独消费总计</span>
            <span>¥{totalIndividualCost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center bg-slate-100 p-2 rounded border border-slate-200">
            <span className="font-serif text-slate-700">均摊池</span>
            <span className="font-mono font-bold text-lg">¥{sharedPool.toFixed(2)}</span>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <h3 className="font-serif text-lg mb-3 text-slate-800 sticky top-0 bg-white py-2 z-10">人均明细</h3>
        {people.length === 0 ? (
          <p className="text-slate-400 font-hand italic text-center py-4">请告诉我都有谁参加...</p>
        ) : (
          <div className="space-y-3 pb-4">
            {result.map((res) => (
              <div key={res.name} className="flex justify-between items-center group">
                <div>
                    <div className="font-bold font-hand text-xl text-slate-800">{res.name}</div>
                    <div className="text-xs font-mono text-slate-500">
                       均摊: ¥{res.baseShare.toFixed(2)} 
                       {res.individual > 0 && <span className="text-indigo-600"> + 单独: ¥{res.individual.toFixed(2)}</span>}
                    </div>
                </div>
                <div className="font-mono text-2xl font-bold text-slate-900 border-b-2 border-transparent group-hover:border-yellow-400 transition-colors">
                    ¥{res.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 right-0 p-2 opacity-10 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.18L18.6 20H5.4L12 6.18z"/></svg>
      </div>
    </div>
  );
};
