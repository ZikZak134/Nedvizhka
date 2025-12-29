import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6 fade-in">
            <ol className="flex items-center space-x-2 text-sm">
                <li>
                    <Link
                        href="/"
                        className="text-slate-400 hover:text-[#d4af37] transition-colors duration-200"
                    >
                        Главная
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-slate-600 mx-2" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-slate-400 hover:text-[#d4af37] transition-colors duration-200"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className="text-[#d4af37] font-medium"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
