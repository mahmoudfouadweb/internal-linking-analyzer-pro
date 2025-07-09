/**
 * @author Gemini
 * @description A basic shared sidebar component for navigation.
 * @created 2025-07-07
 */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// تعريف نوع بيانات للروابط لضمان جودة الكود
interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'لوحة التحكم' },
  { href: '/tools/keyword-extractor', label: 'أداة استخراج الكلمات' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
      <h1 className="text-2xl font-bold mb-4">SEO Pro</h1>
      <nav>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={`block p-2 rounded-md ${pathname === link.href ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}