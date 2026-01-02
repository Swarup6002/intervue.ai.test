import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-secondary/50 to-primary/50 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 mt-auto">
      <div className="max-w-[100rem] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-background font-heading font-bold text-xl">AI</span>
              </div>
              <span className="font-heading text-xl font-bold text-foreground">
                Intervue.ai
              </span>
            </div>
            <p className="font-paragraph text-base text-foreground/70 max-w-md mb-6">
              Master your technical interviews with AI-powered mock interviews. Practice, improve, and land your dream job.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/50 dark:bg-secondary/5 hover:bg-secondary/10 border border-gray-200 dark:border-secondary/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-accent/30"
              >
                <Github className="w-5 h-5 text-gray-700 dark:text-foreground/70 hover:text-accent transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/50 dark:bg-white/5 hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-accent/30"
              >
                <Twitter className="w-5 h-5 text-gray-700 dark:text-white/70 hover:text-accent transition-colors" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/50 dark:bg-white/5 hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-accent/30"
              >
                <Linkedin className="w-5 h-5 text-gray-700 dark:text-white/70 hover:text-accent transition-colors" />
              </a>
              <a
                href="mailto:support@aiinterviewer.com"
                className="w-10 h-10 bg-white/50 dark:bg-white/5 hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-accent/30"
              >
                <Mail className="w-5 h-5 text-gray-700 dark:text-white/70 hover:text-accent transition-colors" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-6">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/interview"
                  className="font-paragraph text-base text-foreground/70 hover:text-accent transition-colors"
                >
                  Start Interview
                </Link>
              </li>
              <li>
                <Link
                  to="/sessions"
                  className="font-paragraph text-base text-gray-600 dark:text-white/70 hover:text-accent transition-colors"
                >
                  Session History
                </Link>
              </li>
              <li>
                <Link
                  to="/developers"
                  className="font-paragraph text-base text-gray-600 dark:text-white/70 hover:text-accent transition-colors"
                >
                  Developers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="font-paragraph text-base text-gray-600 dark:text-white/70 hover:text-accent transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-paragraph text-base text-gray-600 dark:text-white/70 hover:text-accent transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-paragraph text-base text-gray-600 dark:text-white/70 hover:text-accent transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-paragraph text-base text-gray-600 dark:text-white/70 hover:text-accent transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-secondary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-paragraph text-sm text-gray-500 dark:text-foreground/50">
              © {currentYear} Intervue.ai. All rights reserved.
            </p>
            <p className="font-paragraph text-sm text-gray-500 dark:text-foreground/50">
              Powered by Gemini 2.0 AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
