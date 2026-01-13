import { useState } from 'react';
import { apiRequest } from '../api/client.js';
import { User, Mail, MessageSquare, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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

        if (!formData.name || !formData.email || !formData.message) {
            setError('Please fill out all fields.');
            setLoading(false);
            return;
        }

        try {
            await apiRequest('/api/contact', {
                method: 'POST',
                body: formData,
            });
            setSuccess('Your message has been sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', message: '' }); // Clear form on success
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                        Get in Touch
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        We'd love to hear from you.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-800">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 pl-11 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
                                />
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@company.com"
                                    className="w-full px-4 py-3 pl-11 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        {/* Message Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Your Message
                            </label>
                            <div className="relative">
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Let us know how we can help..."
                                    className="w-full px-4 py-3 pl-11 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
                                />
                                <MessageSquare className="absolute left-3.5 top-4 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 text-sm">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg text-white font-semibold bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}