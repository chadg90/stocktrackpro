import React from 'react';
import Navbar from '../components/Navbar';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Privacy <span className="text-primary">Policy</span>
          </h1>

          <div className="prose prose-invert max-w-none">
            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
              <p className="text-white/80 mb-4">
                Stock Track PRO ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, and protect your personal information when you use our website and services.
              </p>
              <p className="text-white/80">
                This policy applies to all users of our website and services, particularly those in the United Kingdom 
                and European Economic Area (EEA).
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <p className="text-white/80 mb-4">We collect the following types of information:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Personal Information:</strong> Name, email address, company name, and contact details when you register or contact us.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Usage Data:</strong> Information about how you use our website and services.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, and cookies.</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Legal Basis for Processing</h2>
              <p className="text-white/80 mb-4">We process your personal data on the following legal bases:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Consent:</strong> Where you have given clear consent for us to process your personal data for a specific purpose.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Contract:</strong> Where processing is necessary for the performance of a contract with you or to take steps at your request before entering into a contract.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Legitimate Interests:</strong> Where processing is necessary for our legitimate interests (such as improving our services) and your interests and fundamental rights do not override those interests.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Legal Obligation:</strong> Where processing is necessary for compliance with a legal obligation to which we are subject.</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <p className="text-white/80 mb-4">We use your information to:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Provide and improve our services</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Communicate with you about our services</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Process your requests and transactions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Improve our website and user experience</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Data Retention</h2>
              <p className="text-white/80 mb-4">
                We retain your personal data for as long as necessary to fulfill the purposes for which we collected it, including:
              </p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Account Information:</strong> Retained for as long as your account is active. After account closure, we retain necessary information for up to 24 months for legal, financial, and reporting obligations.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Communications:</strong> Email communications and support inquiries are retained for up to 24 months.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Usage and Technical Data:</strong> Retained for up to 26 months to provide insights into service usage and performance.</span>
                </li>
              </ul>
              <p className="text-white/80">
                You can request deletion of your data at any time, subject to legal retention requirements.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Firebase as Data Processor</h2>
              <p className="text-white/80 mb-4">
                We use Google Firebase as a data processor to provide our services. Firebase is a platform provided by Google LLC that helps us develop and host our application. 
              </p>
              <p className="text-white/80 mb-4">We use the following Firebase services:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Firebase Authentication:</strong> Processes email addresses and authentication information to provide secure user authentication and account management.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Firestore/Realtime Database:</strong> Stores user profiles, preferences, and application data.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Firebase Storage:</strong> Stores user-uploaded content if applicable.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Firebase Analytics:</strong> Collects anonymous usage statistics to help us improve our services.</span>
                </li>
              </ul>
              <p className="text-white/80">
                Google acts as a data processor in this context, and processes data according to our instructions. Google's compliance with data protection regulations can be found in their privacy policy: <a href="https://policies.google.com/privacy" className="text-primary">https://policies.google.com/privacy</a>.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">International Transfers</h2>
              <p className="text-white/80 mb-4">
                Your personal data may be transferred to, and processed in, countries outside the UK and European Economic Area (EEA). Firebase services may store and process data globally.
              </p>
              <p className="text-white/80">
                When we transfer your data outside the UK/EEA, we ensure a similar degree of protection is afforded by implementing appropriate safeguards, such as relying on the EU-US Data Privacy Framework, standard contractual clauses approved by the European Commission, or other legally approved mechanisms.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Cookie Policy</h2>
              <p className="text-white/80 mb-4">
                We use cookies and similar technologies to enhance your experience on our website. These include:
              </p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Essential Cookies:</strong> Necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you such as logging in or filling in forms.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Functionality Cookies:</strong> Enable the website to provide enhanced functionality and personalization, such as remembering your preferences.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Analytics Cookies:</strong> Allow us to count visits and traffic sources to measure and improve the performance of our site.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Third-Party Cookies:</strong> Set by Firebase and other service providers for analytics and service provision.</span>
                </li>
              </ul>
              <p className="text-white/80">
                You can control and manage cookies through your browser settings. However, restricting cookies may impact your experience of the website.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Children's Data</h2>
              <p className="text-white/80 mb-4">
                Our services are not directed to children under the age of 16. We do not knowingly collect personal data from children under 16. If you are a parent or guardian and believe that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Data Protection Rights</h2>
              <p className="text-white/80 mb-4">Under GDPR and UK data protection law, you have the following rights:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Right to access your personal data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Right to rectification of your personal data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Right to erasure of your personal data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Right to restrict processing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Right to data portability</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Right to object to processing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Rights related to automated decision making and profiling</span>
                </li>
              </ul>
              <p className="text-white/80">
                To exercise these rights, please contact us using the contact information provided at the end of this policy.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
              <p className="text-white/80">
                We implement appropriate technical and organisational measures to protect your personal data against 
                unauthorised or unlawful processing, accidental loss, destruction, or damage. However, no method of 
                transmission over the Internet or electronic storage is 100% secure.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Changes to Privacy Policy</h2>
              <p className="text-white/80 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Posting the new Privacy Policy on our website with an updated revision date</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Sending an email notification to registered users for significant changes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Displaying a notice on our website about the changes</span>
                </li>
              </ul>
              <p className="text-white/80">
                We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
              <p className="text-white/80">
                Our website may contain links to third-party websites or services. We are not responsible for the 
                privacy practices or content of these third-party sites. We encourage you to read the privacy 
                policies of any third-party sites you visit.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Complaints and Contact Information</h2>
              <p className="text-white/80 mb-4">
                If you have any questions about this Privacy Policy or would like to exercise your data protection 
                rights, please contact us at:
              </p>
              <p className="text-white/80 mb-4">
                Email: support@stocktrackpro.com
              </p>
              <p className="text-white/80 mb-4">
                If you are unsatisfied with our response to your concern, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues. You can contact the ICO at:
              </p>
              <p className="text-white/80">
                <a href="https://ico.org.uk/make-a-complaint/" className="text-primary">https://ico.org.uk/make-a-complaint/</a> or by calling their helpline at 0303 123 1113.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 