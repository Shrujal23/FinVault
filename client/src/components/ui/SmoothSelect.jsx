import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PANEL_MOTION =
	'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';

/**
 * Custom select with SpaceX/Grok-style motion: soft scale, blur panel, chevron rotate.
 * @param {{ value: string | number, label: string, disabled?: boolean }[]} options
 */
export default function SmoothSelect({
	id,
	value,
	onChange,
	options,
	placeholder = 'Select…',
	disabled = false,
	className,
	triggerClassName,
	'aria-label': ariaLabel,
}) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const rootRef = useRef(null);
	const listId = useId();

	const enabledOptions = options.filter((o) => !o.disabled);
	const selected = options.find((o) => String(o.value) === String(value));
	const displayLabel = selected?.label ?? placeholder;
	const isPlaceholder = !selected;

	const close = useCallback(() => {
		setOpen(false);
		setActiveIndex(-1);
	}, []);

	const pick = useCallback(
		(next) => {
			if (options.find((o) => String(o.value) === String(next))?.disabled) return;
			onChange(next);
			close();
		},
		[close, onChange, options]
	);

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e) => {
			if (!rootRef.current?.contains(e.target)) close();
		};
		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, [open, close]);

	useEffect(() => {
		if (!open) return;
		const idx = enabledOptions.findIndex((o) => String(o.value) === String(value));
		setActiveIndex(idx >= 0 ? idx : 0);
	}, [open, value, enabledOptions]);

	const onTriggerKeyDown = (e) => {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			setOpen((o) => !o);
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!open) setOpen(true);
			else setActiveIndex((i) => Math.min(i + 1, enabledOptions.length - 1));
		}
		if (e.key === 'ArrowUp' && open) {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		}
		if (e.key === 'Escape') close();
		if (e.key === 'Enter' && open && activeIndex >= 0) {
			e.preventDefault();
			pick(enabledOptions[activeIndex].value);
		}
	};

	return (
		<div ref={rootRef} className={cn('relative', className)}>
			<button
				type="button"
				id={id}
				disabled={disabled}
				aria-label={ariaLabel}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				onClick={() => !disabled && setOpen((o) => !o)}
				onKeyDown={onTriggerKeyDown}
				className={cn(
					'flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200/90 bg-slate-100/90 px-3 py-2.5 text-sm text-left shadow-sm',
					'focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/25',
					'dark:border-slate-600/80 dark:bg-slate-950/70 dark:text-slate-100',
					open && 'border-cyan-500/50 ring-2 ring-cyan-500/20',
					disabled && 'cursor-not-allowed opacity-60',
					isPlaceholder && 'text-slate-400 dark:text-slate-500',
					triggerClassName
				)}
			>
				<span className="truncate font-medium">{displayLabel}</span>
				<ChevronDown
					className={cn(
						'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] dark:text-slate-400',
						open && 'rotate-180'
					)}
					aria-hidden
				/>
			</button>

			<div
				id={listId}
				role="listbox"
				aria-labelledby={id}
				className={cn(
					'absolute left-0 right-0 z-50 mt-1.5 max-h-60 origin-top overflow-auto rounded-lg border border-slate-200/90 bg-white/95 p-1 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md',
					'dark:border-slate-600/70 dark:bg-slate-950/95 dark:shadow-black/50',
					PANEL_MOTION,
					open
						? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
						: 'pointer-events-none -translate-y-1.5 scale-[0.98] opacity-0'
				)}
			>
				{options.map((opt, index) => {
					const isSelected = String(opt.value) === String(value);
					const isActive = enabledOptions[activeIndex] === opt;
					return (
						<button
							key={`${opt.value}-${opt.label}`}
							type="button"
							role="option"
							aria-selected={isSelected}
							disabled={opt.disabled}
							onMouseEnter={() => setActiveIndex(enabledOptions.indexOf(opt))}
							onClick={() => pick(opt.value)}
							className={cn(
								'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150',
								opt.disabled && 'cursor-not-allowed opacity-40',
								isSelected
									? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white'
									: 'text-slate-700 dark:text-slate-200',
								isActive && !isSelected && 'bg-slate-50 dark:bg-slate-800/60',
								!opt.disabled && !isSelected && 'hover:bg-slate-50 dark:hover:bg-slate-800/80'
							)}
						>
							<span className="truncate">{opt.label}</span>
							{isSelected && (
								<Check className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export function SmoothDropdownPanel({ open, children, className, align = 'right' }) {
	return (
		<div
			className={cn(
				'absolute z-50 mt-2 min-w-[12rem] origin-top overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md',
				'dark:border-slate-600/70 dark:bg-slate-950/95 dark:shadow-black/50',
				align === 'right' ? 'right-0' : 'left-0',
				PANEL_MOTION,
				open
					? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
					: 'pointer-events-none -translate-y-2 scale-[0.97] opacity-0',
				className
			)}
			aria-hidden={!open}
		>
			{children}
		</div>
	);
}
