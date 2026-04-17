import { useState } from 'react';
import { apiRequest } from '../api/client.js';
import {
  User,
  Mail,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Clock,
  LifeBuoy,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function ContactPage({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      setError('Please fill in your name, email, and message.');
      setLoading(false);
      return;
    }

    try {
      const body = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        ...(formData.topic?.trim() ? { topic: formData.topic.trim() } : {}),
      };
      await apiRequest('/api/contact', { method: 'POST', body });
      setSuccess('Thanks — we received your message and will reply as soon as we can.');
      setFormData({ name: '', email: '', topic: '', message: '' });
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again or email us directly.');
    } finally {
      setLoading(false);
    }
  }

  const input =
    'w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none transition';
  const label = 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-cyan-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pb-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {setCurrentPage && (
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </button>
        )}

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 shadow-lg">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/15 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">FinVault</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">us</span>
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Questions about billing, your portfolio, or partnerships? Send a note — our team monitors this inbox regularly.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    Human support
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="mt-3 font-semibold text-slate-900 dark:text-white">Response time</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">We aim to reply within 1–2 business days.</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <p className="mt-3 font-semibold text-slate-900 dark:text-white">Direct email</p>
                <a href="mailto:support@finvault.app" className="mt-1 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline break-all">
                  support@finvault.app
                </a>
              </div>
            </div>

          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send a message</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All fields marked with logic below are required.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={`${label} flex items-center gap-2`}>
                      <User className="w-3.5 h-3.5" />
                      Full name
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={input} placeholder="Your name" autoComplete="name" />
                  </div>
                  <div>
                    <label className={`${label} flex items-center gap-2`}>
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={input}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className={`${label} flex items-center gap-2`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    Topic <span className="font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className={input}
                    placeholder="e.g. Billing, Bug report, Partnership"
                  />
                </div>

                <div>
                  <label className={`${label} flex items-center gap-2`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`${input} resize-y min-h-[140px]`}
                    placeholder="What can we help you with?"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/90 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/30 p-4 text-sm text-emerald-900 dark:text-emerald-200">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
