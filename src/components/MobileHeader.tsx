'use client';

import Link from 'next/link';

import { BackButton } from './BackButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

import { Clover } from 'lucide-react';

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='md:hidden relative w-full bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm dark:bg-[#0b0e14]/70 dark:border-white/5'>
      <div className='h-14 flex items-center justify-between px-4'>
        {/* 左侧：返回按钮和设置按钮 */}
        <div className='flex items-center gap-2 z-10'>
          {showBackButton && <BackButton />}
        </div>

        {/* 右侧按钮 */}
        <div className='flex items-center gap-2 z-10'>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {/* 中间：Logo（绝对居中） */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Link
          href='/'
          className='flex items-center gap-1.5 select-none hover:opacity-80 transition-all duration-300'
        >
          <div className='w-6 h-6 rounded-md bg-gradient-to-tr from-green-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-green-500/30'>
            <Clover className='w-3.5 h-3.5 text-white' />
          </div>
          <span className='text-xl font-extrabold bg-gradient-to-r from-green-500 via-fuchsia-400 to-purple-500 text-transparent bg-clip-text tracking-tight drop-shadow-sm'>
            {siteName}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
