// src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Trophy, Bookmark, Video, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Landing() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };

  const particleAnimation = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const textPulse = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut', delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-white overflow-hidden">
      <section className="relative py-32 md:py-48 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/50 via-purple-200/50 to-pink-200/50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30" />
          <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-8" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="fine-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="gray" strokeWidth="0.3" />
              </pattern>
              <pattern id="coarse-grid" width="90" height="90" patternUnits="userSpaceOnUse">
                <path d="M 90 0 L 0 0 0 90" fill="none" stroke="gray" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fine-grid)" />
            <rect width="100%" height="100%" fill="url(#coarse-grid)" />
          </svg>
          <motion.div
            variants={particleAnimation}
            initial="hidden"
            animate="visible"
            className="absolute top-16 left-16 w-36 h-36 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 dark:from-indigo-500/15 dark:to-purple-500/15 rounded-full filter blur-3xl"
          />
          <motion.div
            variants={particleAnimation}
            initial="hidden"
            animate="visible"
            className="absolute bottom-24 right-24 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-500/15 dark:to-pink-500/15 rounded-full filter blur-3xl"
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.h1
            variants={textPulse}
            className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight leading-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
          >
            Never Miss a Contest with Contesso
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Track contests, save favorites, and master solutions—all in one sleek platform.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex justify-center gap-8">
            <Link
              to="/contests"
              className={cn(
                'inline-flex items-center px-8 py-3 text-lg font-medium text-white rounded-full',
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                'shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300'
              )}
            >
              Start Tracking <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className={cn(
                'inline-flex items-center px-8 py-3 text-lg font-medium text-indigo-600 dark:text-indigo-400 rounded-full',
                'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
                'shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-indigo-200/50 dark:border-indigo-900/50'
              )}
            >
              Explore Pricing
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center mb-20 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
          >
            Your Competitive Advantage
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: BarChart2, title: 'Live Tracking', desc: 'Real-time updates from top platforms.' },
              { icon: Trophy, title: 'Contest Insights', desc: 'Analyze past and upcoming contests.' },
              { icon: Bookmark, title: 'Smart Bookmarks', desc: 'Save contests with ease.' },
              { icon: Video, title: 'Solution Vault', desc: 'Expert video solutions on demand.' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className={cn(
                  'p-8 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm',
                  'hover:shadow-md transition-all duration-300 border border-gray-100/50 dark:border-gray-800/50'
                )}
              >
                <feature.icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-6 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-32 px-6 bg-gradient-to-r from-indigo-100/40 via-purple-100/40 to-pink-100/40 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-8 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
          >
            Ready to Dominate Contests?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            Elevate your coding skills with a platform designed for success.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/contests"
              className={cn(
                'inline-flex items-center px-10 py-4 text-lg font-medium text-white rounded-full',
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
                'shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300'
              )}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <footer className="py-24 px-6 bg-gradient-to-t from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Contesso
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 leading-relaxed">Your partner in coding excellence.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><Link to="/contests" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200">Contests</Link></li>
              <li><Link to="/bookmarks" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200">Bookmarks</Link></li>
              <li><Link to="/solutions" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200">Solutions</Link></li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Connect</h3>
            <div className="flex space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-110"><Twitter className="h-6 w-6" /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-110"><Github className="h-6 w-6" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-110"><Linkedin className="h-6 w-6" /></a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Stay Updated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Subscribe for contest alerts.</p>
            <form className="flex items-center space-x-3">
              <input
                type="email"
                placeholder="Your email"
                className="p-3 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 w-full"
              />
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                <Mail className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-16 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Contesso. All rights reserved.
        </div>
      </footer>
    </div>
  );
}