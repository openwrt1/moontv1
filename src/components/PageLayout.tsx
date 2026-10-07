import { BackButton } from './BackButton';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface PageLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const PageLayout = ({ children, activePath = '/' }: PageLayoutProps) => {
  return (
    <div className='w-full min-h-screen relative overflow-hidden bg-white dark:bg-[#0b0e14]'>
      {/* 氛围背景发光效果 */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none'>
        <div className='absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] mix-blend-screen'></div>
        <div className='absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-[100px] mix-blend-screen'></div>
        <div className='absolute bottom-0 left-[20%] w-[60%] h-[40%] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[150px] mix-blend-screen'></div>
      </div>

      {/* 移动端头部 */}
      <MobileHeader showBackButton={['/play'].includes(activePath)} />

      {/* 主要布局容器 */}
      <div className='flex md:grid md:grid-cols-[auto_1fr] w-full min-h-screen md:min-h-auto'>
        {/* 侧边栏 - 桌面端显示，移动端隐藏 */}
        <div className='hidden md:block'>
          <Sidebar activePath={activePath} />
        </div>

        {/* 主内容区域 */}
        <div className='relative min-w-0 flex-1 transition-all duration-300'>
          {/* 桌面端左上角返回按钮 */}
          {['/play'].includes(activePath) && (
            <div className='absolute top-3 left-1 z-20 hidden md:flex'>
              <BackButton />
            </div>
          )}

          {/* 桌面端顶部按钮 */}
          <div className='absolute top-2 right-4 z-20 hidden md:flex items-center gap-2'>
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* 主内容 */}
          <main
            className='flex-1 md:min-h-0 mb-14 md:mb-0'
            style={{
              paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className='md:hidden'>
        <MobileBottomNav activePath={activePath} />
      </div>
    </div>
  );
};

export default PageLayout;
