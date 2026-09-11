'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/session';

interface User {
  id: string;
  username: string;
  phoneNumber: string;
}

export function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const locale = pathname.split('/')[1];
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <nav className="bg-black border-b border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold tracking-widest">CHAPTER ZERO</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-gray-400 transition">
              {t('common.home')}
            </Link>
            <Link href="/shop" className="hover:text-gray-400 transition">
              {t('common.shop')}
            </Link>
            <Link href="/drops" className="hover:text-gray-400 transition">
              {t('common.drops')}
            </Link>
            <Link href="/lore" className="hover:text-gray-400 transition">
              {t('common.lore')}
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/cart" className="hover:text-gray-400 transition">
              {t('common.cart')}
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/profile" className="hover:text-gray-400 transition">
                      {user.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hover:text-gray-400 transition"
                    >
                      {t('common.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-gray-400 transition">
                      {t('auth.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-200 transition"
                    >
                      {t('auth.register')}
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Language Toggle */}
            <Link
              href={otherPath}
              className="text-sm px-2 py-1 border border-gray-600 hover:border-white transition"
            >
              {locale === 'en' ? 'ع' : 'EN'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-900 py-4 space-y-4">
            <Link href="/" className="block hover:text-gray-400 transition">
              {t('common.home')}
            </Link>
            <Link href="/shop" className="block hover:text-gray-400 transition">
              {t('common.shop')}
            </Link>
            <Link href="/drops" className="block hover:text-gray-400 transition">
              {t('common.drops')}
            </Link>
            <Link href="/lore" className="block hover:text-gray-400 transition">
              {t('common.lore')}
            </Link>
            <Link href="/cart" className="block hover:text-gray-400 transition">
              {t('common.cart')}
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/profile" className="block hover:text-gray-400 transition">
                      {user.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block hover:text-gray-400 transition w-full text-left"
                    >
                      {t('common.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block hover:text-gray-400 transition">
                      {t('auth.login')}
                    </Link>
                    <Link href="/register" className="block hover:text-gray-400 transition">
                      {t('auth.register')}
                    </Link>
                  </>
                )}
              </>
            )}
            <Link href={otherPath} className="block text-sm text-gray-400">
              {locale === 'en' ? 'عربي' : 'English'}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
