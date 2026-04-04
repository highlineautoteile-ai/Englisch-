import React from 'react';
import { LogOut, User, BookOpen, Mic2, LayoutDashboard } from 'lucide-react';
import { auth, logout } from '../lib/firebase';
import { cn } from '../lib/utils';

interface NavigationProps {
  activeTab: 'dashboard' | 'lessons' | 'coach';
  setActiveTab: (tab: 'dashboard' | 'lessons' | 'coach') => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const user = auth.currentUser;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-screen md:border-r md:border-t-0 z-50">
      <div className="hidden md:flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          M
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight">Manager English</span>
      </div>

      <div className="flex justify-around md:flex-col md:gap-2">
        <NavItem 
          icon={<LayoutDashboard size={24} />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavItem 
          icon={<BookOpen size={24} />} 
          label="Lessons" 
          active={activeTab === 'lessons'} 
          onClick={() => setActiveTab('lessons')} 
        />
        <NavItem 
          icon={<Mic2 size={24} />} 
          label="Live Coach" 
          active={activeTab === 'coach'} 
          onClick={() => setActiveTab('coach')} 
        />
      </div>

      <div className="hidden md:flex flex-col mt-auto gap-4 px-2 pb-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User size={20} />
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-700 truncate">{user?.displayName || 'User'}</span>
            <span className="text-xs text-slate-500 truncate">{user?.email}</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 p-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2 md:p-4 rounded-xl transition-all duration-200",
        active 
          ? "text-indigo-600 bg-indigo-50 md:bg-indigo-50" 
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      {icon}
      <span className="text-[10px] md:text-base font-semibold">{label}</span>
    </button>
  );
}
