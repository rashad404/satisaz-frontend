'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  MessageSquare,
  Bot,
  Users,
  Zap,
  ArrowRight,
  Check,
  Building2,
  Globe,
  Inbox,
  Languages,
  Smartphone,
  Gift,
  Search,
  Star,
  StickyNote,
  Send,
  Eye,
  Bell,
  Mail,
  Volume2,
  VolumeX,
  Palette,
  Move,
  UserCircle,
  MessageCircle,
  Copy,
} from 'lucide-react';
import {
  SectionHeader,
  BentoGrid,
  FeatureShowcase,
  AISpotlight,
  PricingCard,
  LogoBar,
  TestimonialCard,
  LiveWidgetDemo,
  BrowserMockup,
  WidgetPreview,
} from '@/components/landing';

export default function HomePage() {
  const t = useTranslations();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [widgetColor, setWidgetColor] = useState('#7C3AED');
  const [widgetPosition, setWidgetPosition] = useState<'bottom-left' | 'bottom-right'>('bottom-right');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const colorPresets = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#EC4899'];

  const coreFeatures = [
    {
      icon: Building2,
      title: t('landing.features.multiTenant.title'),
      description: t('landing.features.multiTenant.description'),
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Zap,
      title: t('landing.features.realtime.title'),
      description: t('landing.features.realtime.description'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Inbox,
      title: t('landing.features.unifiedInbox.title'),
      description: t('landing.features.unifiedInbox.description'),
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Languages,
      title: t('landing.features.multiLanguage.title'),
      description: t('landing.features.multiLanguage.description'),
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Smartphone,
      title: t('landing.features.mobileFriendly.title'),
      description: t('landing.features.mobileFriendly.description'),
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Gift,
      title: t('landing.features.freeForever.title'),
      description: t('landing.features.freeForever.description'),
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  const dashboardFeatures = [
    t('landing.dashboard.feature1'),
    t('landing.dashboard.feature2'),
    t('landing.dashboard.feature3'),
    t('landing.dashboard.feature4'),
    t('landing.dashboard.feature5'),
  ];

  const partnerLogos = [
    { name: 'Alert.az', src: '/partners/alertaz.svg' },
    { name: 'Kredit.az', src: '/partners/kreditaz.svg' },
    { name: 'Task.az', src: '/partners/taskaz.svg' },
    { name: 'Sayt.az', src: '/partners/saytaz.svg' },
    { name: 'Kimlik.az', src: '/partners/kimlikaz.svg' },
  ];

  const testimonials = [
    {
      company: 'Alert.az',
      logo: '/partners/alertaz.svg',
      quote: t('landing.testimonials.alertaz'),
    },
    {
      company: 'Kredit.az',
      logo: '/partners/kreditaz.svg',
      quote: t('landing.testimonials.kreditaz'),
    },
    {
      company: 'Sayt.az',
      logo: '/partners/saytaz.svg',
      quote: t('landing.testimonials.saytaz'),
    },
    {
      company: 'Kimlik.az',
      logo: '/partners/kimlikaz.svg',
      quote: t('landing.testimonials.kimlikaz'),
    },
    {
      company: 'Task.az',
      logo: '/partners/taskaz.svg',
      quote: t('landing.testimonials.taskaz'),
    },
  ];

  const howItWorksSteps = [
    {
      step: '1',
      title: t('landing.howItWorks.step1.title'),
      description: t('landing.howItWorks.step1.description'),
    },
    {
      step: '2',
      title: t('landing.howItWorks.step2.title'),
      description: t('landing.howItWorks.step2.description'),
    },
    {
      step: '3',
      title: t('landing.howItWorks.step3.title'),
      description: t('landing.howItWorks.step3.description'),
    },
  ];

  const pricingFeatures = [
    t('landing.pricing.feature1'),
    t('landing.pricing.feature2'),
    t('landing.pricing.feature3'),
    t('landing.pricing.feature4'),
    t('landing.pricing.feature5'),
    t('landing.pricing.feature6'),
  ];

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

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-8">
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Satis.az
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4">
                {t('landing.hero.title')}
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0">
                {t('landing.hero.subtitle')}
              </p>

              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-8">
                <Gift className="w-4 h-4" />
                {t('landing.hero.freeBadge')}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/az/workspaces"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                >
                  {t('landing.hero.ctaSecondary')}
                </a>
              </div>
            </div>

            {/* Right Column - Widget Preview */}
            <div className="hidden lg:block relative">
              <BrowserMockup url="sayt.az" className="aspect-[4/3]">
                <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800 h-full relative">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-4/6" />
                  <WidgetPreview
                    primaryColor="#7C3AED"
                    greetingMessage={t('landing.hero.widgetGreeting')}
                    headerText={t('landing.widgetHeader')}
                  />
                </div>
              </BrowserMockup>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">AI</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('landing.hero.stat1')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('landing.hero.stat2')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">&lt;1s</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('landing.hero.stat3')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIVE WIDGET DEMO ===== */}
      <section id="demo" className="relative px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t('landing.demo.label')}
            title={t('landing.demo.title')}
            description={t('landing.demo.description')}
          />
          <LiveWidgetDemo />
        </div>
      </section>

      {/* ===== CORE FEATURES BENTO GRID ===== */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t('landing.coreFeatures.label')}
            title={t('landing.coreFeatures.title')}
            labelColor="purple"
          />
          <BentoGrid items={coreFeatures} />
        </div>
      </section>

      {/* ===== AGENT DASHBOARD SHOWCASE ===== */}
      <section className="relative px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <FeatureShowcase
            title={t('landing.dashboard.title')}
            description={t('landing.dashboard.description')}
            features={dashboardFeatures}
            visual={
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-4 overflow-hidden">
                {/* Dashboard Mockup */}
                <div className="flex gap-4">
                  {/* Sidebar */}
                  <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 space-y-3">
                    <div className="w-8 h-8 mx-auto bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Inbox className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="w-8 h-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                  {/* Conversation List */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-600">
                      <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800" />
                      <div className="flex-1">
                        <div className="h-3 bg-indigo-200 dark:bg-indigo-700 rounded w-24" />
                        <div className="h-2 bg-indigo-100 dark:bg-indigo-800/50 rounded w-32 mt-1" />
                      </div>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20" />
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-28 mt-1" />
                      </div>
                      <Bot className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-24 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* ===== WIDGET CUSTOMIZATION PREVIEW ===== */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t('landing.widget.label')}
            title={t('landing.widget.title')}
            description={t('landing.widget.description')}
            labelColor="pink"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
            {/* Controls */}
            <div className="space-y-6">
              {/* Color Picker */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('landing.widget.color')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => setWidgetColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${widgetColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Position Toggle */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Move className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('landing.widget.position')}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWidgetPosition('bottom-left')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${widgetPosition === 'bottom-left' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {t('landing.widget.left')}
                  </button>
                  <button
                    onClick={() => setWidgetPosition('bottom-right')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${widgetPosition === 'bottom-right' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {t('landing.widget.right')}
                  </button>
                </div>
              </div>

              {/* Easy Install Callout */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Copy className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{t('landing.widget.easyInstall')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('landing.widget.easyInstallDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <BrowserMockup url="sayt.az" className="aspect-[4/3]">
                <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800 h-full relative">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6" />
                  <WidgetPreview
                    primaryColor={widgetColor}
                    position={widgetPosition}
                    greetingMessage={t('landing.hero.widgetGreeting')}
                    headerText={t('landing.widgetHeader')}
                  />
                </div>
              </BrowserMockup>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI FEATURES SPOTLIGHT ===== */}
      <section className="relative px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <AISpotlight />
        </div>
      </section>

      {/* ===== VISITOR TRACKING & NOTIFICATIONS ===== */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t('landing.tracking.label')}
            title={t('landing.tracking.title')}
            labelColor="green"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visitor Tracking */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('landing.tracking.visitors.title')}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  {t('landing.tracking.visitors.feature1')}
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  {t('landing.tracking.visitors.feature2')}
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  {t('landing.tracking.visitors.feature3')}
                </li>
              </ul>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('landing.tracking.notifications.title')}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {t('landing.tracking.notifications.feature1')}
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Volume2 className="w-4 h-4 text-purple-500" />
                  {t('landing.tracking.notifications.feature2')}
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Send className="w-4 h-4 text-pink-500" />
                  {t('landing.tracking.notifications.feature3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            label={t('landing.howItWorks.label')}
            title={t('landing.howItWorks.title')}
            labelColor="purple"
          />

          <div className="flex flex-col md:flex-row gap-8 md:gap-4">
            {howItWorksSteps.map((item, i) => (
              <div key={i} className="flex-1 relative">
                {/* Connector Line */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700" />
                )}

                <div className="text-center">
                  <div className="inline-flex w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center text-white font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t('landing.socialProof.label')}
            title={t('landing.socialProof.title')}
          />

          {/* Logo Bar */}
          <LogoBar
            logos={partnerLogos}
            title={t('landing.socialProof.trustedBy')}
            className="mb-16"
          />

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard
                key={index}
                company={testimonial.company}
                logo={testimonial.logo}
                quote={testimonial.quote}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="relative px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            label={t('landing.pricing.label')}
            title={t('landing.pricing.title')}
            labelColor="green"
          />

          <PricingCard
            title={t('landing.pricing.planTitle')}
            price={t('landing.pricing.price')}
            features={pricingFeatures}
            ctaText={t('landing.pricing.cta')}
            ctaHref="/az/workspaces"
            highlighted
          />
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNiAxOGgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.cta.title')}</h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                {t('landing.cta.description')}
              </p>
              <Link
                href="/az/workspaces"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('landing.cta.button')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Satis.az</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('landing.footer.description')}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
            &copy; {new Date().getFullYear()} Satis.az. {t('footer.allRightsReserved')}
          </p>
        </div>
      </footer>
    </div>
  );
}
