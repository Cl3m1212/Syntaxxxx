import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Code2, 
  Menu, 
  X, 
  Search, 
  LogOut,
  Terminal,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { base44 } from '../api/base44Client';

const LANGUAGES = [
  "HTML/JS/CSS", "Python", "PHP", "SQL", "React", "Java",  
  "C", "C++","TypeScript", 
];

export default function Layout({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageClick = () => {
    // Close sidebar on mobile after clicking a language
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Backdrop Overlay - Only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 
          transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo with Close Button */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Syntax Code editor</span>
            </div>
            {/* Close button - Mobile only */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search languages..." 
                className="pl-9 bg-slate-800 border-slate-700 text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Language List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {filteredLanguages.map((lang) => (
              <Link 
                key={lang} 
                to={createPageUrl(`Playground?lang=${encodeURIComponent(lang)}`)}
                onClick={handleLanguageClick}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group
                  ${currentPageName === 'Playground' && window.location.search.includes(lang)
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  {lang}
                </div>
                {currentPageName === 'Playground' && window.location.search.includes(lang) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </Link>
            ))}
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-bold"></span>
          </div>
          
          {user && (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
              {user.email[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}