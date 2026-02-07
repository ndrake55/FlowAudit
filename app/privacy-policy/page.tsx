import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <PublicHeader />
            </div>
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-20 prose prose-blue dark:prose-invert">
                <h1>Privacy Policy</h1>
                <p className="lead">Last Updated: February 7, 2026</p>

                <p>
                    At FlowAudit, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website and use our services.
                </p>

                <h2>1. Information We Collect</h2>
                <h3>Personal Data</h3>
                <p>
                    Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
                </p>

                <h3>Derivative Data</h3>
                <p>
                    Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                </p>

                <h3>Financial Data</h3>
                <p>
                    Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, Stripe, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.
                </p>

                <h3>Uploaded Documents</h3>
                <p>
                    We collect and process the utility bills and other documents you upload to the Service for the purpose of generating audit reports. We implement strict security measures to protect the confidentiality of these documents.
                </p>

                <h2>2. Use of Your Information</h2>
                <p>
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Process your payments and refunds.</li>
                    <li>Generate the reports and analytics you request.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                    <li>Increase the efficiency and operation of the Site.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Notify you of updates to the Site.</li>
                    <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                </ul>

                <h2>3. Disclosure of Your Information</h2>
                <p>
                    We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                </p>

                <h3>By Law or to Protect Rights</h3>
                <p>
                    If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                </p>

                <h3>Third-Party Service Providers</h3>
                <p>
                    We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance. We currently use Clerk for authentication, Stripe for payments, and Vercel for hosting.
                </p>

                <h2>4. Security of Your Information</h2>
                <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>

                <h2>5. Policy for Children</h2>
                <p>
                    We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                </p>

                <h2>6. Contact Us</h2>
                <p>
                    If you have questions or comments about this Privacy Policy, please contact us at:
                </p>
                <p>
                    FlowAudit Inc.<br />
                    Email: privacy@flowaudit.com
                </p>
            </main>
            <PublicFooter />
        </div>
    );
}
