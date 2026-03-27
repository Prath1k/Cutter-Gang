'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type Message = {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
  user_avatar?: string;
};

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setMessages(data);
    };
    fetchHistory();

    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const text = newMessage.trim();
    setNewMessage('');
    
    // Use auth user info or fallback
    const displayName = user?.user_metadata.full_name || user?.email?.split('@')[0] || 'Guest' + Math.floor(Math.random() * 1000);
    const avatarUrl = user?.user_metadata.avatar_url || null;

    const { error } = await supabase.from('chat_messages').insert([{
      user_id: user?.id || 'guest',
      user_name: displayName,
      message: text,
      user_avatar: avatarUrl
    }]);

    if (error) console.error('Error sending message:', error.message);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Dynamic Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 bg-red-600 text-white p-4 sm:p-5 rounded-3xl shadow-2xl hover:bg-red-700 transition-all hover:scale-105 active:scale-95 z-40 flex items-center gap-3 pr-6 group"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-red-600 rounded-full"></span>
        </div>
        <span className="font-black uppercase tracking-tighter text-sm">Chat</span>
      </button>

      {/* Slide Over Chat Panel - Full Width on Mobile */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#050505] border-l border-neutral-900 z-[60] transform transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Chat Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-neutral-900 bg-[#050505] sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Chat</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Live Now</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl border border-white/5 active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth scrollbar-hide">
          <div className="text-center">
            <span className="text-[10px] text-neutral-700 font-black uppercase tracking-[0.3em] bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800/50">
              Welcome to the Gang
            </span>
          </div>
          
          {messages.map((msg) => {
            const isMe = user && (msg.user_name === (user.user_metadata.full_name || user.email?.split('@')[0]));
            return (
              <div key={msg.id} className={`flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.user_avatar ? (
                    <img src={msg.user_avatar} alt="" className="w-5 h-5 rounded-full border border-red-600/50" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <User className="w-3 h-3 text-neutral-600" />
                    </div>
                  )}
                  <span className={`text-[10px] font-black tracking-tighter uppercase px-2 py-0.5 rounded ${isMe ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                    {msg.user_name}
                  </span>
                  <span className="text-[9px] text-neutral-600 font-mono">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed max-w-[90%] font-medium ${
                  isMe 
                    ? 'bg-red-600 text-white rounded-tr-none shadow-xl shadow-red-600/10' 
                    : 'bg-neutral-900 text-neutral-200 rounded-tl-none border border-neutral-800/50'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 sm:p-6 pb-8 sm:pb-6 border-t border-neutral-900 bg-[#080808]">
          {!user && (
            <p className="text-[10px] text-red-500 font-black uppercase tracking-tight mb-3 text-center opacity-70">
              Warning: Sending as Guest
            </p>
          )}
          <div className="relative flex items-center gap-3">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={user ? "Talk your shit..." : "Sign in to talk..."}
              className="flex-1 bg-neutral-900 text-white px-6 py-4 rounded-2xl border border-neutral-800 focus:outline-none focus:border-red-600 focus:ring-0 transition-all placeholder:text-neutral-600 text-sm font-medium"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-neutral-200 active:scale-95 transition-all shadow-xl disabled:bg-neutral-800 disabled:text-neutral-600"
            >
              <Send className="w-5 h-5 transform translate-x-0.5" />
            </button>
          </div>
        </form>
      </div>
      
      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
