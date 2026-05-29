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

  const inputClass = "w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none transition-all";
  const labelClass = "text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pb-12">
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

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Sidebar Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-xl">
              <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold tracking-widest mb-3">
                  FINVAULT SUPPORT
                </div>
                
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Get in touch
                </h1>
                
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Questions. Bug reports. Feature requests. We read every message and reply as fast as we can.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950 px-4 py-2 text-sm text-cyan-700 dark:text-cyan-300">
                  
                  Real human support
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="mt-5 font-semibold text-slate-900 dark:text-white">Typical response</p>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Within 1–2 business days</p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <p className="mt-5 font-semibold text-slate-900 dark:text-white">Direct email</p>
                <a 
                  href="mailto:support@finvault.app" 
                  className="mt-1.5 block text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  support@finvault.app
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Drop us a line</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">We usually reply within a day.</p>

              <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
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
                  <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-red-800 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-10 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
    </div>
  );
}