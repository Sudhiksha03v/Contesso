// src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Bookmark, Video, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

/**
 * A cutting-edge landing page for Contesso Contest Tracker.
 * Features a sleek animated hero, modern feature showcase, bold CTA, and refined footer.
 * Optimized for light/dark themes with futuristic aesthetics and subtle interactivity.
 */
export default function Landing() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const orbitAnimation = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.1, 1],
      rotate: 360,
      transition: { duration: 10, repeat: Infinity, ease: 'linear' },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-pink-900/50" />
          <motion.div
            variants={orbitAnimation}
            initial="hidden"
            animate="visible"
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full filter blur-2xl"
          />
          <motion.div
            variants={orbitAnimation}
            initial="hidden"
            animate="visible"
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-400/20 dark:bg-purple-600/20 rounded-full filter blur-2xl"
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
          >
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Contesso
            </span>{' '}
            — Master Every Contest
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Your all-in-one hub for tracking coding contests, saving favorites, and unlocking expert solutions.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex justify-center gap-6">
            <Link
              to="/contests"
              className={cn(
                'inline-flex items-center px-8 py-3 text-lg font-medium text-white rounded-xl',
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                'shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300'
              )}
            >
              Start Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className={cn(
                'inline-flex items-center px-8 py-3 text-lg font-medium text-indigo-600 dark:text-indigo-400 rounded-xl',
                'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700',
                'shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300'
              )}
            >
              Pricing
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white"
          >
            Elevate Your Coding Game
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Trophy,
                title: 'Track Contests',
                desc: 'Live updates from Codeforces, LeetCode, and beyond.',
              },
              {
                icon: Bookmark,
                title: 'Bookmark Ease',
                desc: 'Save contests with a single click.',
              },
              {
                icon: Video,
                title: 'Solution Mastery',
                desc: 'Dive into curated video explanations.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={cn(
                  'p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg',
                  'transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800'
                )}
              >
                <feature.icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-20 px-6 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Join the Coding Elite
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto"
          >
            Empower your skills with tools designed for winners.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/contests"
              className={cn(
                'inline-flex items-center px-10 py-4 text-lg font-medium text-white rounded-xl',
                'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl',
                'transition-all duration-300 transform hover:-translate-y-1'
              )}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">Contesso</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Your gateway to coding excellence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contests" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                  Contests
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                  Bookmarks
                </Link>
                  Bookmarks
                </li>
              <li>
                <Link to="/solutions" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
            <div className="flex space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                <Github className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Subscribe for contest updates.</p>
            <form className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-all duration-200"
              >
                <Mail className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Contesso. All rights reserved.
        </div>
      </footer>
    </div>
  );
}