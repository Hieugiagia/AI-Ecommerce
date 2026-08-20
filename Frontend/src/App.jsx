import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Gọi thử test API từ Backend Spring Boot
    axios.get('http://localhost:8080/test/hello')
      .then(res => setBackendStatus(res.data.message || 'Connected'))
      .catch(() => setBackendStatus('Backend is Offline (Start Spring Boot to connect)'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-full">
            <ShoppingBag className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          AI E-Commerce Platform <Sparkles className="w-5 h-5 text-yellow-400" />
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          React + Vite + Tailwind CSS Skeleton
        </p>

        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between text-sm">
          <span className="text-slate-400">Backend Status:</span>
          <span className="font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {backendStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;