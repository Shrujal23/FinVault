export function Skeleton({ className = '' }) {
	return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}></div>;
}

export function CardsSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<Skeleton className="h-20" />
			<Skeleton className="h-20" />
			<Skeleton className="h-20" />
			<Skeleton className="h-20" />
		</div>
	);
}

export function TableSkeleton() {
	return (
		<div>
			<div className="space-y-2">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="h-8" />
				))}
			</div>
		</div>
	);
}
