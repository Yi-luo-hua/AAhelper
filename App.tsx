
import React, { useState, useCallback, useEffect } from 'react';
import { IndividualExpense, ChatMessage, CalculatorState } from './types';
import { parseReceiptImage, processChatCommand } from './services/geminiService';
import { ReceiptList } from './components/ReceiptList';
import { ChatInterface } from './components/ChatInterface';
import { SummaryPanel } from './components/SummaryPanel';

function App() {
  const [totalBill, setTotalBill] = useState<number>(0);
  const [people, setPeople] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<IndividualExpense[]>([]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'system', text: '你好！请设置账单总额并告诉我都有谁参与分摊。', timestamp: Date.now() }
  ]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [missingKey, setMissingKey] = useState(false);

  // Check for API Key on mount
  useEffect(() => {
    // @ts-ignore - process.env.API_KEY is replaced by Vite at build time
    if (!process.env.API_KEY) {
      setMissingKey(true);
    }
  }, []);

  // Handle Receipt Upload - Sets Total and notifies user
  const handleFileUpload = useCallback(async (file: File) => {
    if (missingKey) return;
    setIsAnalyzing(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: '正在扫描小票总额...', timestamp: Date.now() }]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const data = await parseReceiptImage(base64);
        
        setTotalBill(data.total);
        
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'system', 
            text: `我找到了总额 ¥${data.total}。${data.itemsSummary} 现在你可以告诉我具体谁消费了什么以便单独计算。`, 
            timestamp: Date.now() 
        }]);

      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'system', 
            text: '无法清晰读取小票，请手动输入总额。', 
            timestamp: Date.now() 
        }]);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [missingKey]);

  // Handle Chat Commands
  const handleSendMessage = useCallback(async (text: string) => {
    if (missingKey) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    
    setIsProcessingChat(true);

    try {
        const currentState: CalculatorState = { totalBill, people, individualExpenses: expenses };
        const result = await processChatCommand(text, currentState);
        
        // Apply Updates
        if (result.data.setTotal !== undefined && result.data.setTotal !== null) {
            setTotalBill(result.data.setTotal);
        }

        if (result.data.addPeople && result.data.addPeople.length > 0) {
            setPeople(prev => {
                const newSet = new Set([...prev, ...result.data.addPeople!]);
                return Array.from(newSet);
            });
        }

        if (result.data.addExpense && result.data.addExpense.length > 0) {
            const newExpenses = result.data.addExpense.map(e => ({
                id: Date.now().toString() + Math.random().toString().slice(2),
                person: e.person,
                item: e.item,
                cost: e.cost
            }));
            setExpenses(prev => [...prev, ...newExpenses]);
            
            // Also ensure these people exist in the people list
            const involvedPeople = newExpenses.map(e => e.person);
            setPeople(prev => {
                 const newSet = new Set([...prev, ...involvedPeople]);
                 return Array.from(newSet);
            });
        }

        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.reply, timestamp: Date.now() }]);

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: "我没听清，请再说一遍。", timestamp: Date.now() }]);
    } finally {
        setIsProcessingChat(false);
    }
  }, [totalBill, people, expenses, missingKey]);

  const handleRemoveExpense = (id: string) => {
      setExpenses(prev => prev.filter(e => e.id !== id));
  };

  if (missingKey) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f7f5f0] p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-red-500 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">未配置 API Key</h1>
          <p className="text-slate-700 mb-6">
            应用程序无法连接到 Google Gemini 服务。
          </p>
          <div className="text-left bg-slate-100 p-4 rounded text-sm space-y-2 mb-6">
            <p>1. 去 <strong>Google AI Studio</strong> 获取 API Key。</p>
            <p>2. 在 <strong>Vercel 项目设置</strong> 中添加环境变量：</p>
            <code className="block bg-slate-200 p-2 rounded mt-1 font-mono">API_KEY=你的密钥</code>
            <p>3. 重新部署项目。</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row p-4 gap-4 max-w-7xl mx-auto overflow-hidden">
        {/* Left Column: The Bill & Expenses - Fixed layout with internal scrolling */}
        <div className="flex-1 flex flex-col gap-4 h-full min-h-0">
            {/* Top: Calculator Summary (50%) */}
            <div className="flex-1 min-h-0 overflow-hidden">
               <SummaryPanel 
                 totalBill={totalBill} 
                 people={people} 
                 expenses={expenses} 
                 onTotalChange={setTotalBill}
               />
            </div>

            {/* Bottom: Individual Expense List (50%) */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ReceiptList expenses={expenses} onRemove={handleRemoveExpense} />
            </div>
        </div>

        {/* Right Column: Chat Interface - Full Height */}
        <div className="w-full md:w-[400px] h-full flex flex-col min-h-0">
             <div className="h-full min-h-0">
                <ChatInterface 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    onFileUpload={handleFileUpload}
                    isProcessing={isProcessingChat || isAnalyzing} 
                />
             </div>
        </div>
    </div>
  );
}

export default App;
