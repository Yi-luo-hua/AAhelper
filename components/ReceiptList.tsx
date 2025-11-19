
import React from 'react';
import { IndividualExpense } from '../types';

interface ReceiptListProps {
  expenses: IndividualExpense[];
  onRemove: (id: string) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ expenses, onRemove }) => {
  return (
    <div className="flex flex-col h-full border-2 border-slate-800 bg-[#fffdf9] paper-shadow rounded-sm relative overflow-hidden">
      {/* Tape effect */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-yellow-100/50 rotate-1 border-l border-r border-white/50 blur-[0.5px] z-20"></div>
      
      <div className="p-6 border-b-2 border-slate-800 bg-[#f4f1ea] flex-shrink-0">
        <h2 className="font-serif text-2xl font-bold text-slate-900 italic">单独消费项目</h2>
        <p className="text-sm font-mono text-slate-600 mt-1">不参与均摊的费用明细</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 relative min-h-0">
        {/* Notebook lines background */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', 
               backgroundSize: '100% 2rem',
               top: '2rem'
             }}>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center text-slate-400 font-hand text-xl mt-10 rotate-2 relative z-10">
            暂无单独消费项目。<br/>所有费用均摊！
          </div>
        ) : (
          <table className="w-full relative z-10 text-left border-collapse">
            <thead className="sticky top-0 bg-[#fffdf9] z-10 shadow-sm">
              <tr className="font-mono text-xs uppercase tracking-widest text-slate-500 border-b-2 border-slate-800">
                <th className="pb-2 pl-2 bg-[#fffdf9]">姓名</th>
                <th className="pb-2 bg-[#fffdf9]">项目</th>
                <th className="pb-2 text-right bg-[#fffdf9]">金额</th>
                <th className="pb-2 w-8 bg-[#fffdf9]"></th>
              </tr>
            </thead>
            <tbody className="font-hand text-lg">
              {expenses.map((exp) => (
                <tr key={exp.id} className="group hover:bg-yellow-50 transition-colors bg-[#fffdf9]">
                  <td className="py-2 pl-2 border-b border-slate-300 text-indigo-800 font-bold">{exp.person}</td>
                  <td className="py-2 border-b border-slate-300 text-slate-700">{exp.item}</td>
                  <td className="py-2 border-b border-slate-300 text-right font-mono text-base font-bold">¥{exp.cost.toFixed(2)}</td>
                  <td className="py-2 border-b border-slate-300 text-right">
                    <button 
                      onClick={() => onRemove(exp.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 font-mono font-bold px-2"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
