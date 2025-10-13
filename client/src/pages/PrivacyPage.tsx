import React from "react";
import Layout from "../components/Layout";

const PrivacyPage = () => {
  return (
    <Layout header="PRIVACY POLICY">
      <div className="border border-slate-700 p-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-wider mb-4">
              PRIVACY POLICY
            </h1>
            <div className="h-px bg-slate-700 mb-4"></div>
            <p className="text-sm text-slate-400">
              Last Updated: October 13, 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">OVERVIEW</h2>
            <div className="bg-green-950/30 border border-green-800/50 p-6">
              <p className="text-green-200 font-bold mb-2">
                ✓ YOUR PRIVACY IS PROTECTED
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Warlok Duels is a privacy-first application. We do not collect,
                store, or transmit any personal data. This website runs entirely
                in your browser without any backend servers or data collection
                mechanisms.
              </p>
            </div>
          </div>

          {/* What We Don't Collect */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">
              WHAT WE DON'T COLLECT
            </h2>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">✗</div>
                <div className="flex-1">
                  <div className="font-bold">Personal Information</div>
                  <p className="text-sm text-slate-400">
                    No names, email addresses, or contact information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">✗</div>
                <div className="flex-1">
                  <div className="font-bold">User Accounts</div>
                  <p className="text-sm text-slate-400">
                    No registration, login, or account creation required
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">✗</div>
                <div className="flex-1">
                  <div className="font-bold">Analytics or Tracking</div>
                  <p className="text-sm text-slate-400">
                    No cookies, tracking pixels, or analytics services
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">✗</div>
                <div className="flex-1">
                  <div className="font-bold">Game Data</div>
                  <p className="text-sm text-slate-400">
                    Your decks and game progress are stored locally in your
                    browser only
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">✗</div>
                <div className="flex-1">
                  <div className="font-bold">Third-Party Services</div>
                  <p className="text-sm text-slate-400">
                    No third-party advertising, social media, or data brokers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">HOW IT WORKS</h2>
            <div className="bg-black/30 border border-slate-700 p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Warlok Duels is a static web application. All game logic runs
                entirely in your web browser using JavaScript. When you create
                decks or play games:
              </p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    Data is stored locally in your browser's localStorage
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    No information is sent to any server or external service
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    Clearing your browser data will remove all saved progress
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    Your data never leaves your device and is never accessible
                    to us
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* External Links */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">
              EXTERNAL LINKS
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Warlok Duels may contain links to external websites (such as card
              image hosting services). We are not responsible for the privacy
              practices of external sites. We encourage you to review their
              privacy policies before providing any personal information.
            </p>
          </div>

          {/* Browser Storage */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">
              LOCAL BROWSER STORAGE
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your browser's localStorage may be used to save your game
              preferences and deck configurations. This data:
            </p>
            <ul className="space-y-2 text-slate-300 text-sm mt-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Remains on your device only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Can be cleared at any time through browser settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  Is never transmitted to our servers (we don't have any)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  Is not shared with any third parties or advertising networks
                </span>
              </li>
            </ul>
          </div>

          {/* Children's Privacy */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">
              CHILDREN'S PRIVACY
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Warlok Duels is safe for all ages. Since we don't collect any
              personal information from anyone, including children under 13, we
              comply with children's privacy protection regulations by design.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">
              CHANGES TO THIS POLICY
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes
              will be reflected by updating the "Last Updated" date at the top
              of this policy. Since we don't collect contact information, we
              cannot notify you directly of changes.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">CONTACT US</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <div className="bg-black/30 border border-slate-700 p-4">
              <a
                href="mailto:justin@crispcode.io"
                className="text-blue-400 hover:text-blue-300 transition-colors font-mono"
              >
                justin@crispcode.io
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center">
            <div className="h-px bg-slate-700 mb-4"></div>
            <p className="text-xs text-slate-500 tracking-widest">
              WARLOK DUELS © 2025 - PRIVACY-FIRST GAMING
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
