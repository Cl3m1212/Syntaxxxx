import React from 'react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Terminal, Cpu, Globe, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  const categories = [
    {
      title: "Web Development",
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      langs: ["HTML", "CSS", "JavaScript", "React", "Vue", "Angular"]
    },
    {
      title: "Backend & Systems",
      icon: Terminal,
      color: "text-green-400",
      bg: "bg-green-500/10",
      langs: ["Python", "Java", "C++", "Go", "Rust", "Node.js"]
    },
    {
      title: "Data & Analysis",
      icon: Database,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      langs: ["SQL", "NumPy", "R", "SciPy", "PostgreSQL", "MongoDB"]
    },
    {
      title: "Modern Tech",
      icon: Cpu,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      langs: ["AWS", "Kotlin", "Swift", "Rust", "Go", "TypeScript"]
    }
  ];

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-16 py-12">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Code Playground
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white"
          >
            Write. Run. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Master.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            An advanced online code editor supporting 40+ languages. 
            No setup required. Just start coding in the cloud.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link to={createPageUrl('Playground?lang=Python')}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-lg">
                Start Coding Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${cat.bg}`}>
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white">{cat.title}</h3>
              
              <div className="flex flex-wrap gap-2">
                {cat.langs.map(lang => (
                  <Link key={lang} to={createPageUrl(`Playground?lang=${encodeURIComponent(lang)}`)}>
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs font-medium hover:bg-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-700/50">
                      {lang}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Features / Footer area */}
        <div className="border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
        
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>

      </div>
    </div>
  );
}