
import React, { useState, useCallback } from 'react';
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

  // Handle Receipt Upload - Sets Total and notifies user
  const handleFileUpload = useCallback(async (file: File) => {
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
  }, []);

  // Handle Chat Commands
  const handleSendMessage = useCallback(async (text: string) => {
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
  }, [totalBill, people, expenses]);

  const handleRemoveExpense = (id: string) => {
      setExpenses(prev => prev.filter(e => e.id !== id));
  };

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
