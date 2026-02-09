import type { Metadata } from 'next';
import { GraduationCap, FileText, Scale, Users, Briefcase, AlertCircle, CheckCircle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service - LearnSphere',
    description: 'Read the Terms of Service for using the LearnSphere eLearning platform.',
};

export default function TermsOfServicePage() {
    const sections = [
        {
            icon: CheckCircle,
            title: '1. Acceptance of Terms',
            content: `By accessing or using LearnSphere ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.

These Terms apply to all visitors, users, and others who access or use the Platform, including learners, instructors, and administrators.`
        },
        {
            icon: Users,
            title: '2. User Accounts',
            content: `**Account Creation**: To access certain features, you must create an account. You agree to:
• Provide accurate, current, and complete information
• Maintain and update your information as needed
• Keep your password secure and confidential
• Notify us immediately of any unauthorized access

**Account Responsibility**: You are responsible for all activities that occur under your account. LearnSphere is not liable for any loss or damage arising from your failure to maintain the security of your account.`
        },
        {
            icon: FileText,
            title: '3. Content and Intellectual Property',
            content: `**Platform Content**: All content on the Platform, including courses, videos, text, graphics, and logos, is owned by LearnSphere or its licensors and is protected by intellectual property laws.

**User Content**: By submitting content (reviews, comments, course materials), you grant LearnSphere a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute such content.

**Instructor Content**: Instructors retain ownership of their course materials but grant LearnSphere the right to host, display, and distribute courses through the Platform.`
        },
        {
            icon: Scale,
            title: '4. Acceptable Use',
            content: `You agree NOT to:
• Use the Platform for any illegal purpose or in violation of any laws
• Share your account credentials with others
• Download or copy course content for redistribution
• Interfere with or disrupt the Platform's operation
• Attempt to gain unauthorized access to any systems
• Harass, abuse, or threaten other users
• Submit false or misleading information
• Use automated tools to access the Platform without permission`
        },
        {
            icon: Briefcase,
            title: '5. Payments and Refunds',
            content: `**Pricing**: Course prices are set by instructors and may change at any time. Promotions and discounts are at LearnSphere's discretion.

**Payments**: All payments are processed securely through our payment providers. By making a purchase, you agree to pay all applicable fees.

**Refunds**: We offer a 30-day refund policy for most courses. Refunds may be denied if you have completed a significant portion of the course or violated these Terms.

**Instructor Earnings**: Instructors receive their share of course revenue according to the Instructor Agreement.`
        },
        {
            icon: XCircle,
            title: '6. Termination',
            content: `**By You**: You may close your account at any time through your account settings or by contacting support.

**By Us**: We may suspend or terminate your account if you:
• Violate these Terms
• Engage in fraudulent activity
• Create risk or legal exposure for LearnSphere
• Have been inactive for an extended period

**Effect of Termination**: Upon termination, your right to access the Platform ceases immediately. Some provisions of these Terms survive termination.`
        },
        {
            icon: AlertCircle,
            title: '7. Disclaimers and Limitations',
            content: `**As-Is Basis**: The Platform is provided "as is" without warranties of any kind, either express or implied.

**Limitation of Liability**: In no event shall LearnSphere be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.

**Maximum Liability**: Our total liability to you for any claims shall not exceed the amount you paid to us in the 12 months preceding the claim.`
        },
        {
            icon: Scale,
            title: '8. Governing Law',
            content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which LearnSphere operates, without regard to conflict of law principles.

Any disputes arising from these Terms shall be resolved through binding arbitration, except where prohibited by law.`
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-foreground">LearnSphere</span>
                    </Link>
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto max-w-4xl px-4 py-12">
                {/* Title */}
                <div className="mb-12 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="mb-4 text-4xl font-bold text-foreground">Terms of Service</h1>
                    <p className="text-muted-foreground">
                        Last updated: February 9, 2026
                    </p>
                </div>

                {/* Introduction */}
                <div className="mb-12 rounded-lg border bg-card p-6">
                    <p className="text-muted-foreground">
                        Welcome to LearnSphere! These Terms of Service govern your use of our eLearning platform
                        and services. By using LearnSphere, you agree to these terms. Please read them carefully
                        before creating an account or accessing any content.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <section key={index} className="rounded-lg border bg-card p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                                </div>
                                <div className="prose prose-sm max-w-none text-muted-foreground">
                                    {section.content.split('\n').map((paragraph, pIndex) => (
                                        <p key={pIndex} className="whitespace-pre-wrap">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Changes Notice */}
                <div className="mt-12 rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 shrink-0 text-orange-600 dark:text-orange-400" />
                        <div>
                            <h3 className="mb-1 font-semibold text-orange-800 dark:text-orange-300">Changes to These Terms</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-400">
                                We may update these Terms from time to time. We will notify you of any material changes
                                by posting the new Terms on this page and updating the "Last updated" date. Your continued
                                use of the Platform after changes constitutes acceptance of the new Terms.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
                    <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Questions About These Terms?</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        If you have any questions about these Terms of Service, please contact our legal team.
                    </p>
                    <a
                        href="mailto:legal@learnsphere.com"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Mail className="h-4 w-4" />
                        legal@learnsphere.com
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} LearnSphere Inc. All rights reserved.</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms</Link>
                        <Link href="/" className="hover:text-foreground">Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
