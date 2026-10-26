import { useState, useCallback } from 'react';
import { apiRequest } from '../api/client.js';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StatusMessage from '../components/StatusMessage.jsx';
import useAppNavigate from '../hooks/useAppNavigate';
import { formFieldClass } from '@/lib/formClasses.js';
import SmoothSelect from '@/components/ui/SmoothSelect.jsx';
import { CONTACT_TOPIC_OPTIONS } from '@/lib/selectOptions.js';

export default function ContactPage() {
  const go = useAppNavigate();
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

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);

      if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
        setError('Please add your name, email, and a short message.');
        setLoading(false);
        return;
      }

      try {
        const topicLabel = CONTACT_TOPIC_OPTIONS.find((t) => t.value === formData.topic)?.label;
        const body = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          message: formData.message.trim(),
          ...(formData.topic && {
            topic: topicLabel && topicLabel !== 'Pick a topic (optional)' ? topicLabel : formData.topic,
          }),
        };

        await apiRequest('/api/contact', { method: 'POST', body });

        setSuccess('Thanks — we got your message. If this were production, someone would reply by email.');
        setFormData({ name: '', email: '', topic: '', message: '' });
      } catch (err) {
        setError(err.message || 'Could not send right now. Try support@finvault.app if you have it set up.');
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <button
        type="button"
        onClick={() => go('home')}
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </button>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Contact
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
            Questions, bug reports, or &ldquo;why does this number look wrong?&rdquo; — send a note. This form hits our
            API and gets logged on the server (we don&apos;t spam you).
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Typical reply time for a student project: when someone checks their inbox. For demos, that might mean never —
            but the flow is real.
          </p>
          <p className="mt-6 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Prefer email? </span>
            <a
              href="mailto:support@finvault.app"
              className="font-medium text-cyan-700 hover:underline dark:text-cyan-400"
            >
              support@finvault.app
            </a>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Write to us</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All fields except topic are required.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelClass}>Your name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${formFieldClass} mt-1.5`}
                  placeholder="e.g. Priya"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClass}>Email</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${formFieldClass} mt-1.5`}
                  placeholder="you@school.edu"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-topic" className={labelClass}>Topic</label>
              <SmoothSelect
                id="contact-topic"
                value={formData.topic}
                onChange={(v) => setFormData((prev) => ({ ...prev, topic: v }))}
                options={CONTACT_TOPIC_OPTIONS}
                className="mt-1.5"
                aria-label="Message topic"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`${formFieldClass} mt-1.5 min-h-[140px] resize-y`}
                placeholder="Tell us what happened — steps to reproduce help for bugs."
                required
              />
            </div>

            {error && <StatusMessage variant="error" message={error} onDismiss={() => setError('')} />}
            {success && <StatusMessage variant="success" message={success} onDismiss={() => setSuccess('')} />}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
