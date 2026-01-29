'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Bot, Users, Zap, ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950" />
        <div
          className="absolute w-96 h-96 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
            left: `${mousePosition.x - 200}px`,
            top: `${mousePosition.y - 200}px`,
            transition: 'all 0.3s ease-out',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-50 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
                <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Satis.az
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4 max-w-3xl mx-auto">
            AI-Powered Live Chat Platform for Your Business
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 mb-10 max-w-2xl mx-auto">
            Engage visitors with intelligent AI responses. Seamlessly hand off to human agents when needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/az/workspaces"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">AI</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Powered Responses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">&lt;1s</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Features</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Auto-Response</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligent AI handles conversations when agents are busy. Supports OpenAI, Claude, and Gemini.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Seamless Handoff</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Human agents can take over from AI anytime. Transfer conversations between team members.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Real-time Streaming</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI responses stream word-by-word. Real-time typing indicators and message delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">How It Works</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
              Simple Setup, Powerful Results
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '1', title: 'Create Workspace', desc: 'Set up your workspace and configure AI settings' },
              { step: '2', title: 'Add Widget', desc: 'Copy the embed code to your website' },
              { step: '3', title: 'Start Chatting', desc: 'AI handles visitors, agents take over when needed' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNiAxOGgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Transform your customer support with AI-powered live chat.
              </p>
              <Link
                href="/az/workspaces"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Satis.az</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            AI-Powered Live Chat Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
