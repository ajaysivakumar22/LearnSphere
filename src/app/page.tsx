'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  GraduationCap, BookOpen, Brain, Trophy, Sparkles, ArrowRight,
  CheckCircle2, Users, Laptop, Zap, Globe, Star, ShieldCheck
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HomePage() {
  const { isLoggedIn, userRole, isLoaded } = useAuth();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    if (isLoaded && isLoggedIn) {
      if (userRole === 'admin') router.replace('/admin/dashboard');
      else if (userRole === 'instructor') router.replace('/instructor/dashboard');
      else router.replace('/learner/my-courses');
    }
  }, [isLoaded, isLoggedIn, userRole, router]);

  const floatingVariants = {
    initial: { y: 0, opacity: 0 },
    animate: {
      y: [0, -20, 0],
      opacity: 1,
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      {/* Navbar Placeholder (if global nav isn't handling it) */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          LearnSphere
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
        </div>
        <Link href="/sign-in">
          <button className="px-5 py-2 rounded-full border border-border bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all text-sm font-medium">
            Sign In
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-32 overflow-hidden">
        {/* Floating Icons */}
        <motion.div className="absolute left-[10%] top-[25%] hidden lg:block" variants={floatingVariants} initial="initial" animate="animate">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>
        <motion.div className="absolute right-[12%] top-[20%] hidden lg:block" variants={floatingVariants} initial="initial" animate="animate" transition={{ delay: 1 }}>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <Trophy className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
        <motion.div className="absolute bottom-[20%] left-[15%] hidden lg:block" variants={floatingVariants} initial="initial" animate="animate" transition={{ delay: 1.5 }}>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <Brain className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>
        <motion.div className="absolute bottom-[25%] right-[18%] hidden lg:block" variants={floatingVariants} initial="initial" animate="animate" transition={{ delay: 2 }}>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <Sparkles className="h-8 w-8 text-pink-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The Future of Learning is Here
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            Unlock Your <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Potential.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, manage, and master courses with the most intuitive platform designed for comprehensive growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in">
              <button className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center gap-2 group">
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/learner/explore">
              <button className="h-14 px-8 rounded-full border border-border bg-card/50 backdrop-blur-sm text-foreground font-bold text-lg hover:bg-accent transition-all">
                Explore Courses
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trusted By (Mock) */}
      <section className="border-y border-border/50 bg-muted/20 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY INNOVATORS WORLDWIDE</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'GlobalTech', 'Nebula Inc', 'FutureWorks', 'EduVerse'].map(name => (
              <span key={name} className="text-xl font-bold">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features tailored for Instructors, Admins, and Learners to ensure a seamless educational journey.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: Laptop, title: 'Interactive Course Builder', desc: 'Drag-and-drop lessons, rich text editing, and media integration.' },
              { icon: Zap, title: 'Instant Quizzes', desc: 'Auto-graded assessments to test knowledge retention immediately.' },
              { icon: Globe, title: 'Global Accessibility', desc: 'Learn from anywhere, anytime, on any device with responsive design.' },
              { icon: ShieldCheck, title: 'Secure & Private', desc: 'Enterprise-grade security ensuring your data is safe and sound.' },
              { icon: Trophy, title: 'Gamified Progress', desc: 'Earn badges, track streaks, and climb the leaderboard.' },
              { icon: Users, title: 'Community Driven', desc: 'Connect with peers and instructors through course discussions.' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works / Stats */}
      <section id="how-it-works" className="py-32 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Designed for real results</h2>
              <div className="space-y-8">
                {[
                  { title: 'Create', desc: 'Instructors build comprehensive courses in minutes.' },
                  { title: 'Learn', desc: 'Students engage with interactive content and quizzes.' },
                  { title: 'Certify', desc: 'Earn recognized certificates upon completion.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <motion.div
                style={{ y }}
                className="rounded-2xl border bg-background p-8 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Learners</p>
                    <p className="text-3xl font-bold">12,543+</p>
                  </div>
                  <Users className="w-10 h-10 text-primary/50" />
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Courses Completed</p>
                    <p className="text-3xl font-bold">45,900+</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-500/50" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor Rating</p>
                    <p className="text-3xl font-bold">4.9/5</p>
                  </div>
                  <Star className="w-10 h-10 text-yellow-500/50" />
                </div>
              </motion.div>
              {/* Decor blobs */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-purple-900 to-indigo-900 p-12 md:p-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-500/30 blur-[100px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/30 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to start your journey?</h2>
            <p className="text-purple-200 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of learners and instructors transforming their careers with LearnSphere today.
            </p>
            <Link href="/sign-in">
              <button className="h-16 px-10 rounded-full bg-white text-purple-900 font-bold text-xl hover:bg-purple-50 transition-all shadow-xl">
                Get Started for Free
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold text-foreground">LearnSphere</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} LearnSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
