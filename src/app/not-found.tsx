'use client';

import { motion } from 'framer-motion';
import { Search, Home, ArrowLeft, Compass, GraduationCap } from 'lucide-react';
import { Button } from '@/components/shared/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
            </div>

            {/* 404 Number */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="relative"
            >
                <h1 className="text-[150px] font-black leading-none text-primary/10 sm:text-[200px]">
                    404
                </h1>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-border shadow-2xl">
                        <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Page Not Found
                </h2>
                <p className="mt-3 max-w-md text-muted-foreground">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let&apos;s get you back on track.
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>
                <Link href="/">
                    <Button variant="default" size="lg" className="w-full gap-2">
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                </Link>
            </motion.div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
            >
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                    Popular destinations
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/learner/explore">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Compass className="h-4 w-4" />
                            Explore Courses
                        </Button>
                    </Link>
                    <Link href="/learner/my-courses">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            My Courses
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
