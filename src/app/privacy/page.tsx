import type { Metadata } from 'next';
import { GraduationCap, Shield, Lock, Eye, Database, UserCheck, Mail, Globe, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy - LearnSphere',
    description: 'Learn how LearnSphere collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: Database,
            title: 'Information We Collect',
            content: `We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us for support. This includes:
      
• **Account Information**: Name, email address, password, and profile picture
• **Payment Information**: Billing address and payment method details (processed securely by our payment providers)
• **Course Data**: Progress, quiz answers, completion certificates, and reviews
• **Communications**: Messages sent through our platform and support inquiries`
        },
        {
            icon: Eye,
            title: 'How We Use Your Information',
            content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments, questions, and customer service requests
• Monitor and analyze trends, usage, and activities
• Personalize your learning experience and recommend courses
• Detect, investigate, and prevent fraudulent or unauthorized activities`
        },
        {
            icon: Shield,
            title: 'Information Sharing',
            content: `We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:

• **Service Providers**: We share data with trusted third parties who assist us in operating our platform (hosting, analytics, payment processing)
• **Legal Requirements**: When required by law or to protect our rights and safety
• **Business Transfers**: In connection with any merger, sale of company assets, or acquisition
• **With Your Consent**: When you explicitly agree to the sharing`
        },
        {
            icon: Lock,
            title: 'Data Security',
            content: `We implement appropriate technical and organizational security measures to protect your personal information, including:

• Encryption of data in transit (TLS/SSL) and at rest
• Regular security assessments and penetration testing
• Access controls and authentication mechanisms
• Secure data centers with physical security measures
• Regular backups and disaster recovery procedures`
        },
        {
            icon: UserCheck,
            title: 'Your Rights',
            content: `Depending on your location, you may have the following rights regarding your personal data:

• **Access**: Request a copy of your personal data
• **Correction**: Request correction of inaccurate data
• **Deletion**: Request deletion of your personal data
• **Portability**: Receive your data in a structured, machine-readable format
• **Objection**: Object to processing of your personal data
• **Restriction**: Request restriction of processing

To exercise these rights, contact us at privacy@learnsphere.com`
        },
        {
            icon: Globe,
            title: 'Cookies and Tracking',
            content: `We use cookies and similar tracking technologies to:

• Keep you signed in to your account
• Remember your preferences and settings
• Analyze how our platform is used
• Deliver personalized content and recommendations

You can control cookies through your browser settings. Note that disabling cookies may affect your experience on our platform.`
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
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="mb-4 text-4xl font-bold text-foreground">Privacy Policy</h1>
                    <p className="text-muted-foreground">
                        Last updated: February 9, 2026
                    </p>
                </div>

                {/* Introduction */}
                <div className="mb-12 rounded-lg border bg-card p-6">
                    <p className="text-muted-foreground">
                        At LearnSphere, we take your privacy seriously. This Privacy Policy explains how we collect,
                        use, disclose, and safeguard your information when you use our eLearning platform. Please
                        read this policy carefully to understand our practices regarding your personal data.
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

                {/* Contact */}
                <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
                    <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Questions About Privacy?</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        If you have any questions about this Privacy Policy, please contact us.
                    </p>
                    <a
                        href="mailto:privacy@learnsphere.com"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Mail className="h-4 w-4" />
                        privacy@learnsphere.com
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
