import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	onCancel,
	danger = false,
}) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === 'Escape') onCancel?.();
		};
		document.addEventListener('keydown', onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prev;
		};
	}, [open, onCancel]);

	if (!open) return null;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
			<button
				type="button"
				className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
				aria-label="Dismiss"
				onClick={onCancel}
			/>
			<div
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="confirm-dialog-title"
				aria-describedby="confirm-dialog-desc"
				className="relative w-full max-w-md origin-bottom rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:origin-center"
			>
				<h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-white">
					{title}
				</h2>
				<p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
					{description}
				</p>
				<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
							danger
								? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
								: 'bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500'
						}`}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
