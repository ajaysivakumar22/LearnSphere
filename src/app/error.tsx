'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/shared/button';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            {/* Animated Error Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="relative"
            >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-destructive/30"
                />
            </motion.div>

            {/* Error Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <h1 className="text-3xl font-bold text-foreground">Something went wrong!</h1>
                <p className="mt-3 max-w-md text-muted-foreground">
                    We apologize for the inconvenience. An unexpected error occurred while processing your request.
                </p>

                {/* Error Details (Development) */}
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-left">
                        <summary className="cursor-pointer text-sm font-medium text-foreground">
                            <Bug className="mr-2 inline h-4 w-4" />
                            Error Details
                        </summary>
                        <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                            {error.message}
                            {error.digest && `\nDigest: ${error.digest}`}
                        </pre>
                    </details>
                )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
                <Button
                    onClick={reset}
                    variant="default"
                    size="lg"
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Link href="/">
                    <Button variant="outline" size="lg" className="w-full gap-2">
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                </Link>
            </motion.div>

            {/* Support Link */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-sm text-muted-foreground"
            >
                If this problem persists,{' '}
                <Link href="/support" className="text-primary hover:underline">
                    contact support
                </Link>
            </motion.p>
        </div>
    );
}
