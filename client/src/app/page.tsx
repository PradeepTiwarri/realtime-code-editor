'use client';

import Link from 'next/link';
import {
  Users,
  Zap,
  Terminal,
  Globe,
  ArrowRight,
  Menu,
  X,
  MessageSquare,
  Mic,
  PenTool,
  History,
  Code2,
  Shield,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Real-time Code Editor",
      description: "Powered by Monaco Editor with syntax highlighting for 50+ languages. See your teammate's cursor and edits in real-time.",
      color: "bg-blue-500",
      lightBg: "bg-blue-100"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Team Chat",
      description: "Built-in messaging to discuss code, share ideas, and communicate without leaving the editor.",
      color: "bg-purple-500",
      lightBg: "bg-purple-100"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Communication",
      description: "Talk to your team with crystal-clear WebRTC voice chat. Perfect for pair programming and interviews.",
      color: "bg-rose-500",
      lightBg: "bg-rose-100"
    },
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "Collaborative Whiteboard",
      description: "Draw diagrams, sketch ideas, and visualize concepts together on a shared infinite canvas.",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-100"
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Version History",
      description: "Automatic code snapshots with one-click restore. Never lose your work again.",
      color: "bg-orange-500",
      lightBg: "bg-orange-100"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Rooms",
      description: "Private, encrypted sessions with unique room links. Your code stays between you and your team.",
      color: "bg-cyan-500",
      lightBg: "bg-cyan-100"
    }
  ];

  const useCases = [
    { title: "Technical Interviews", description: "Evaluate candidates with live coding challenges" },
    { title: "Pair Programming", description: "Debug and build features together in real-time" },
    { title: "Code Reviews", description: "Walk through changes with voice and visual annotations" },
    { title: "Teaching & Mentoring", description: "Guide students through concepts interactively" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 flex flex-col">

      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">

          {/* Brand Name */}
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gray-900">Code</span>
              <span className="text-blue-600">Sync</span>
            </span>
          </div>

          {/* Desktop Auth Buttons */}
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

          {/* Mobile Menu Button */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
            <Sparkles className="w-4 h-4" />
            <span>Now with Voice Chat & Whiteboard</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 sm:mb-8 leading-tight">
            Code together, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              in real-time.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one collaborative coding platform. Share code, draw diagrams,
            talk to your team, and build amazing things together—no setup required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
            <div className="ml-4 px-3 py-1 bg-gray-900 rounded-md text-xs text-gray-400 font-mono hidden sm:flex items-center gap-2">
              <span>main.js</span>
              <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-400">2 users editing</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs">
                <Mic className="w-3 h-3" />
                <span className="hidden sm:inline">Voice Active</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-purple-400 text-xs">
                <MessageSquare className="w-3 h-3" />
                <span className="hidden sm:inline">3</span>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm md:text-base overflow-x-auto">
            <div className="text-blue-400">const <span className="text-yellow-400">collaboration</span> = <span className="text-purple-400">require</span>(<span className="text-green-400">'@codesync/magic'</span>);</div>
            <div className="text-gray-300 mt-2">async <span className="text-blue-400">function</span> <span className="text-yellow-400">codeTogether</span>() {'{'}</div>
            <div className="text-gray-300 ml-4">await <span className="text-yellow-400">editor</span>.<span className="text-blue-400">sync</span>(); <span className="text-gray-500">// Real-time code sync ⚡</span></div>
            <div className="text-gray-300 ml-4">await <span className="text-yellow-400">voice</span>.<span className="text-blue-400">connect</span>(); <span className="text-gray-500">// Talk to your team 🎙️</span></div>
            <div className="text-gray-300 ml-4">await <span className="text-yellow-400">whiteboard</span>.<span className="text-blue-400">draw</span>(); <span className="text-gray-500">// Sketch ideas ✏️</span></div>
            <div className="text-gray-300 ml-4"><span className="text-purple-400">return</span> <span className="text-green-400">"Happy Coding! 🚀"</span>;</div>
            <div className="text-gray-300">{'}'}</div>
          </div>
        </div>
      </main>

      {/* --- Features Grid --- */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to code together
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From live coding to voice chat, we've built every tool you need for seamless remote collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${feature.lightBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <div className={`${feature.color} p-2 rounded-lg text-white`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Use Cases Section --- */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for every collaboration
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Whether you're interviewing candidates or teaching students, CodeSync adapts to your workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-blue-100 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-16 sm:py-24 bg-white px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to code together?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of developers who are already collaborating in real-time.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-xl"
          >
            Get Started — It's Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 sm:py-12">
        <div className="w-full px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand Name */}
          <div className="flex items-center">
            <span className="font-semibold">
              <span className="text-gray-900">Code</span>
              <span className="text-blue-600">Sync</span>
            </span>
          </div>

          <div className="text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} CodeSync. Built with ❤️ for developers.
          </div>

          {/* Icons */}
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