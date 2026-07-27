import { useState, useCallback } from 'react';
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
} from 'lucide-react';
import StatusMessage from '../components/StatusMessage.jsx';


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

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      setError('Name, email, and message are required.');
      setLoading(false);
      return;
    }

    try {
      const body = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
        ...(formData.topic?.trim() && { topic: formData.topic.trim() }),
      };

      await apiRequest('/api/contact', { method: 'POST', body });

      setSuccess("Got it. We'll be in touch soon.");
      setFormData({ name: '', email: '', topic: '', message: '' });
    } catch (err) {
      setError(err.message || "Couldn't send that. Try emailing support@finvault.app directly.");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const inputClass = "w-full mt-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-950/80 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.15),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] pb-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        {setCurrentPage && (
          <button
            onClick={() => setCurrentPage('home')}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        )}

        <div className="grid lg:grid-cols-[1.05fr_1.35fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.22)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                FinVault support
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                We’re here if you need us.
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                Whether you’re stuck on a feature, want to share feedback, or just want to say hello, this is the right place. We read every note and try to reply thoughtfully.
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                <p className="font-medium text-slate-800 dark:text-slate-100">Most messages are answered within a business day.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="mt-4 font-semibold text-slate-900 dark:text-white">Typical response</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Usually within 1–2 business days.</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <p className="mt-4 font-semibold text-slate-900 dark:text-white">Prefer email?</p>
                <a href="mailto:support@finvault.app" className="mt-1 block text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-400">
                  support@finvault.app
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-7 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-slate-900/90 sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Send a message</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Tell us what’s on your mind and we’ll get back to you as soon as we can.</p>

              <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4" />
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Alex Sharma"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Mail className="w-4 h-4" />
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <MessageSquare className="w-4 h-4" />
                    Topic <span className="font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <MessageSquare className="w-4 h-4" />
                    Your message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={7}
                    className={`${inputClass} resize-y min-h-[160px]`}
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                {error && (
                  <StatusMessage
                    variant="error"
                    message={error}
                    onDismiss={() => setError('')}
                  />
                )}

                {success && (
                  <StatusMessage
                    variant="success"
                    message={success}
                    onDismiss={() => setSuccess('')}
                  />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 py-4 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {loading ? 'Sending message...' : 'Send message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  )
}