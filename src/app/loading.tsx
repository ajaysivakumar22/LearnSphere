'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            {/* Animated Logo */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30"
                >
                    <GraduationCap className="h-10 w-10 text-primary-foreground" />
                </motion.div>

                {/* Pulse Ring */}
                <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                />
            </motion.div>

            {/* Brand Name */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-6"
            >
                <h1 className="text-2xl font-bold text-foreground">LearnSphere</h1>
            </motion.div>

            {/* Loading Dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex gap-1.5"
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -8, 0],
                            opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15
                        }}
                        className="h-2.5 w-2.5 rounded-full bg-primary"
                    />
                ))}
            </motion.div>

            {/* Subtle Text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-sm text-muted-foreground"
            >
                Preparing your learning experience...
            </motion.p>
        </div>
    );
}
