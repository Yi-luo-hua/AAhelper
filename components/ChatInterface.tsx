
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, onFileUpload, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  return (
    <div className="flex flex-col h-full border-2 border-slate-800 bg-white paper-shadow rounded-sm">
      <div className="p-4 border-b-2 border-slate-800 bg-slate-900 text-white flex justify-between items-center">
        <h2 className="font-serif text-lg italic">AA 制助手</h2>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#fffdf9]">
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 font-hand text-2xl text-center rotate-1">
                <p>您可以说：</p>
                <p>“总额是 500”</p>
                <p>“张三、李四、王五”</p>
                <p>或点击回形针上传小票</p>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 font-hand text-lg leading-snug shadow-sm border-2 ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white border-slate-800 rounded-t-xl rounded-bl-xl'
                  : 'bg-white text-slate-900 border-slate-900 rounded-t-xl rounded-br-xl'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-white border-2 border-slate-900 px-4 py-2 rounded-full flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t-2 border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border-2 border-transparent hover:border-slate-300"
            title="上传小票"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入金额、姓名或消费项目..."
            className="flex-1 font-mono text-sm px-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-colors placeholder:text-slate-400 rounded-sm"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 py-2 font-bold border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50 rounded-sm"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
};
