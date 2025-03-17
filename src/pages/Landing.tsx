// src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Trophy, Bookmark, Video, Twitter, Github, Linkedin } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion'; 

/**
 * A highly modernized landing page for Contesso Contest Tracker.
 * Features a refined hero, animated features, sleek CTA, and an improved footer with socials.
 * Designed with cutting-edge aesthetics: gradients, animations, and glassmorphism.
 */
export default function Landing() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative py-24 md:py-36 px-6"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent mb-6 tracking-tight">
            Never miss a single code contest with Contesso
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your ultimate companion for tracking coding contests, saving favorites, and mastering solutions.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              to="/dashboard"
              className={cn(
                'inline-flex items-center px-8 py-3 text-lg font-semibold text-white rounded-full',
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                'shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300'
              )}
            >
              Start Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className={cn(
                'inline-flex items-center px-8 py-3 text-lg font-semibold text-indigo-600 dark:text-indigo-400 rounded-full',
                'bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-700/90',
                'shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300'
              )}
            >
              Explore Pricing
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-400/10 rounded-full filter blur-3xl -z-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full filter blur-3xl -z-20 animate-pulse" />
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Unleash Your Coding Potential
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BarChart2,
                title: 'Live Contest Tracking',
                desc: 'Real-time updates from top platforms like Codeforces and LeetCode.',
              },
              {
                icon: Trophy,
                title: 'Contest Insights',
                desc: 'Analyze upcoming and past contests with ease.',
              },
              {
                icon: Bookmark,
                title: 'Intelligent Bookmarks',
                desc: 'Save contests effortlessly for quick access.',
              },
              {
                icon: Video,
                title: 'Solution Hub',
                desc: 'Curated video solutions to boost your skills.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={cn(
                  'p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg',
                  'hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300'
                )}
              >
                <feature.icon className="h-10 w-10 text-indigo-500 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-24 px-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Join the Future of Coding
          </h2>
          <p className="text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Empower your coding journey with tools designed for winners.
          </p>
          <Link
            to="/dashboard"
            className={cn(
              'inline-flex items-center px-10 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-full',
              'shadow-xl hover:shadow-2xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300'
            )}
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent tracking-tight uppercase">
                Contesso
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              Your all-in-one platform for coding contest success.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contests" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm">
                  Contests
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
                <Github className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              © {new Date().getFullYear()} Contesso. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}