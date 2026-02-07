import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function TermsOfUse() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <PublicHeader />
            </div>
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-20 prose prose-blue dark:prose-invert">
                <h1>Terms of Use</h1>
                <p className="lead">Last Updated: February 7, 2026</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the FlowAudit website and services (the "Service"), you agree to be bound by these Terms of Use ("Terms"). inside. If you do not agree to these Terms, please do not use the Service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    FlowAudit provides AI-powered utility audit and revenue verification tools for the laundromat industry. Our Service analyzes utility bills and other data provided by users to estimate revenue and operational metrics.
                </p>
                <p>
                    <strong>Disclaimer:</strong> The insights, reports, and calculations provided by FlowAudit are for informational and due diligence purposes only. They do not constitute financial, investment, or legal advice. You assume full responsibility for any business decisions made based on our data.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                    To access certain features, you must register for an account. you agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
                </p>

                <h2>4. User Data and Privacy</h2>
                <p>
                    You retain all rights to the data, files, and information you upload to the Service ("User Data"). By uploading User Data, you grant FlowAudit a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such User Data solely for the purpose of providing and improving the Service.
                </p>
                <p>
                    We take data privacy seriously. Please review our <a href="/privacy-policy">Privacy Policy</a> to understand how we collect, use, and share your information.
                </p>

                <h2>5. Intellectual Property</h2>
                <p>
                    The Service and its original content (excluding User Data), features, and functionality are and will remain the exclusive property of FlowAudit Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                </p>

                <h2>6. Prohibited Uses</h2>
                <p>
                    You agree not to use the Service:
                </p>
                <ul>
                    <li>In any way that violates any applicable national or international law or regulation.</li>
                    <li>for the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                    <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.</li>
                    <li>To impersonate or attempt to impersonate FlowAudit, a FlowAudit employee, another user, or any other person or entity.</li>
                </ul>

                <h2>7. Limitation of Liability</h2>
                <p>
                    In no event shall FlowAudit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                </p>

                <h2>8. Changes to Terms</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>

                <h2>9. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us at support@flowaudit.com.
                </p>
            </main>
            <PublicFooter />
        </div>
    );
}
