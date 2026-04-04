import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { UserProfile, Lesson } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { LessonList } from './components/LessonList';
import { LiveCoach } from './components/LiveCoach';
import { LogIn, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SAMPLE_LESSONS: Lesson[] = [
  { id: 'l1', title: 'Begrüßung & Fabrikführung', category: 'Kommunikation', content: '# Begrüßung\nLerne wie man sich und die Stanzerei (Stamping Shop) vorstellt.', difficulty: 'Beginner' },
  { id: 'l2', title: 'Produktions-Meetings', category: 'Management', content: '# Meetings\nFachbegriffe für Schichtübergaben und Produktionsplanung.', difficulty: 'Intermediate' },
  { id: 'l3', title: 'Qualitätskontrolle (QC)', category: 'Technik', content: '# Qualität\nBegriffe wie Toleranzen, Werkzeugbau (Tool & Die) und Ausschuss.', difficulty: 'Advanced' },
  { id: 'l4', title: 'Sicherheit am Arbeitsplatz', category: 'Leadership', content: '# Arbeitssicherheit\nAnweisungen für Sicherheit in der Produktion geben.', difficulty: 'Intermediate' },
  { id: 'l5', title: 'Lieferanten-Gespräche', category: 'Einkauf', content: '# Einkauf\nVerhandlungen über Material (Stahl/Coils) und Werkzeuge.', difficulty: 'Beginner' },
];

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'coach'>('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create initial profile
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            level: 'Beginner',
            completedLessons: [],
            totalPoints: 0,
            lastActive: new Date().toISOString(),
          };
          setDoc(userRef, newProfile);
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
      setIsAuthReady(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Lade Manager English Coach...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64 pb-20 md:pb-0">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard profile={profile} />}
            {activeTab === 'lessons' && (
              <LessonList 
                lessons={SAMPLE_LESSONS} 
                completedIds={profile?.completedLessons || []} 
                onSelect={(lesson) => {
                  // In a real app, open lesson view
                  // For now, just mark as completed to show progress
                  if (profile && !profile.completedLessons.includes(lesson.id)) {
                    updateDoc(doc(db, 'users', user.uid), {
                      completedLessons: arrayUnion(lesson.id),
                      totalPoints: increment(100),
                      lastActive: new Date().toISOString()
                    });
                  }
                }}
              />
            )}
            {activeTab === 'coach' && <LiveCoach />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="flex-1 p-8 md:p-20 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-8 shadow-xl shadow-indigo-100">
            M
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Manager English Coach</h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Bereite dich professionell auf deinen Management-Lehrgang in der Stanztechnik vor. Verbessere dein technisches Business-Englisch mit KI-Unterstützung.
          </p>

          <div className="space-y-6 mb-12">
            <Feature icon={<Sparkles className="text-indigo-600" />} text="KI-Live-Coaching für flüssiges Sprechen" />
            <Feature icon={<ShieldCheck className="text-emerald-600" />} text="Strukturiertes Vokabeltraining für Manager" />
            <Feature icon={<Zap className="text-amber-600" />} text="Echtzeit-Feedback zu deiner Aussprache" />
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <LogIn size={20} />
            Mit Google anmelden
          </button>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 bg-indigo-600 relative overflow-hidden items-center justify-center p-20">
        <div className="relative z-10 text-center">
          <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[40px] border border-white/20 shadow-2xl">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-lg">
              <Sparkles size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">KI-gestütztes Lernen</h2>
            <p className="text-indigo-100 text-lg max-w-sm mx-auto">
              Unser intelligenter Coach passt sich deinem Tempo an und hilft dir, die Hürden des Manager-Alltags auf Englisch zu meistern.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium text-slate-700">{text}</span>
    </div>
  );
}
