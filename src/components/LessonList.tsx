import React from 'react';
import { motion } from 'motion/react';
import { Book, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { Lesson } from '../types';
import { cn } from '../lib/utils';

interface LessonListProps {
  lessons: Lesson[];
  completedIds: string[];
  onSelect: (lesson: Lesson) => void;
}

export function LessonList({ lessons, completedIds, onSelect }: LessonListProps) {
  const categories = Array.from(new Set(lessons.map(l => l.category)));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Lektionen</h1>
        <p className="text-slate-500">Strukturiertes Training für deinen Manager-Lehrgang.</p>
      </header>

      {categories.map((cat, catIdx) => (
        <section key={cat} className="mb-12">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600 rounded-full" />
            {cat}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.filter(l => l.category === cat).map((lesson, idx) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                isCompleted={completedIds.includes(lesson.id)}
                onClick={() => onSelect(lesson)}
                index={idx}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonCard({ lesson, isCompleted, onClick, index }: { lesson: Lesson, isCompleted: boolean, onClick: () => void, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer group hover:shadow-md hover:border-indigo-100 transition-all relative overflow-hidden",
        isCompleted && "bg-slate-50/50"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"
        )}>
          {isCompleted ? <CheckCircle2 size={20} /> : <Book size={20} />}
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="text-xs font-bold">100 XP</span>
        </div>
      </div>

      <h3 className="font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{lesson.title}</h3>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
          lesson.difficulty === 'Beginner' ? "bg-emerald-50 text-emerald-600" : 
          lesson.difficulty === 'Intermediate' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
        )}>
          {lesson.difficulty}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between text-indigo-600 font-bold text-sm">
        <span>{isCompleted ? "Wiederholen" : "Starten"}</span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}
