'use client';

import Link from 'next/link';
import { Code2, Users, Zap, Terminal, Globe, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 flex flex-col">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        {/* 'px-4 sm:px-8' gives a little padding, 'justify-between' pushes items to edges */}
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
          
          {/* Logo (Extreme Left) */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CodeSync</span>
          </div>

          {/* Desktop Auth Buttons (Extreme Right) */}
          <div className="hidden sm:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all hover:shadow-lg"
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile Menu Button (Visible only on small screens) */}
          <div className="sm:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col items-center">
              <Link 
                href="/login"
                className="block w-full text-center py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center py-3 text-base font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <main className="flex-grow pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v1.0 is now live
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 sm:mb-8 leading-tight">
            Collaborate on code <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              in real-time.
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Share code, debug together, and conduct technical interviews seamlessly. 
            No setup required—just create a room and start coding.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start Coding Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all hover:border-gray-300 text-center"
            >
              Join Existing Room
            </Link>
          </div>
        </div>

        {/* --- Feature Preview / Code Mockup --- */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-900">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="ml-4 px-3 py-1 bg-gray-900 rounded-md text-xs text-gray-400 font-mono hidden sm:block">
              main.js — CodeSync
            </div>
          </div>
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm md:text-base overflow-x-auto">
            <div className="text-blue-400">const <span className="text-yellow-400">collaboration</span> = <span className="text-purple-400">require</span>(<span className="text-green-400">'magic'</span>);</div>
            <div className="text-gray-300 mt-2">async <span className="text-blue-400">function</span> <span className="text-yellow-400">codeTogether</span>() {'{'}</div>
            <div className="text-gray-300 ml-4">await <span className="text-yellow-400">socket</span>.<span className="text-blue-400">connect</span>();</div>
            <div className="text-gray-500 ml-4">// Real-time updates across the globe 🌍</div>
            <div className="text-gray-300 ml-4"><span className="text-purple-400">return</span> <span className="text-green-400">"Happy Coding!"</span>;</div>
            <div className="text-gray-300">{'}'}</div>
          </div>
        </div>
      </main>

      {/* --- Features Grid --- */}
      <section className="py-16 sm:py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by Socket.io, changes are reflected instantly across all connected devices. No lag, no conflicts.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Create private rooms, invite your team, and work on the same file simultaneously. Perfect for interviews.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Developer First</h3>
              <p className="text-gray-600 leading-relaxed">
                Clean interface with syntax highlighting, line numbers, and dark mode support. Built for focus.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-100 py-8 sm:py-12">
        <div className="w-full px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo (Extreme Left) */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-900 p-1.5 rounded-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">CodeSync</span>
          </div>
          
          <div className="text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} CodeSync. Built with love ❤️
          </div>

          {/* Icons (Extreme Right) */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}