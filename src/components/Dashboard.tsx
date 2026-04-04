import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, Zap, Clock } from 'lucide-react';
import { UserProfile } from '../types';

interface DashboardProps {
  profile: UserProfile | null;
}

export function Dashboard({ profile }: DashboardProps) {
  if (!profile) return null;

  const stats = [
    { label: 'Gesamtpunkte', value: profile.totalPoints, icon: <Trophy className="text-amber-500" />, color: 'bg-amber-50' },
    { label: 'Lektionen', value: profile.completedLessons.length, icon: <Target className="text-indigo-500" />, color: 'bg-indigo-50' },
    { label: 'Level', value: profile.level, icon: <Zap className="text-emerald-500" />, color: 'bg-emerald-50' },
    { label: 'Zuletzt aktiv', value: new Date(profile.lastActive).toLocaleDateString(), icon: <Clock className="text-slate-500" />, color: 'bg-slate-50' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Willkommen zurück, {profile.displayName?.split(' ')[0]}!</h1>
        <p className="text-slate-500">Bereit für dein heutiges Management-Englisch-Training?</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.color)}>
              {stat.icon}
            </div>
            <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
            <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap size={20} className="text-indigo-600" />
            Nächste Schritte
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all">
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-700">Meeting-Vokabular</h3>
                <p className="text-sm text-slate-500">Lerne, wie man Meetings leitet.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
                →
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all">
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-700">Live-Sprechtraining</h3>
                <p className="text-sm text-slate-500">Übe freies Sprechen mit dem KI-Coach.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
                →
              </div>
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Tipp des Tages</h2>
            <p className="text-indigo-100 mb-6 leading-relaxed">
              "Verwende 'Tolerances' (Toleranzen) und 'Tooling' (Werkzeuge), um technische Details in der Stanztechnik präzise zu besprechen."
            </p>
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors">
              Mehr Tipps
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-400 rounded-full opacity-20 blur-2xl"></div>
        </section>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
