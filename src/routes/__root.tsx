import { useEffect } from 'react';
import { HeadContent, Scripts, createRootRoute, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import Sidebar from '@/components/layouts/Sidebar';
import MobileNav from '@/components/layouts/MobileNav';
import AuthGuard from '@/components/layouts/AuthGuard';
import QuickEntry from '@/components/transactions/QuickEntry';
import { useQuickEntryStore } from '@/stores/quick-entry-store';

import appCss from '@/styles.css?url';

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('finos-theme');var theme='system';if(stored){try{var parsed=JSON.parse(stored);theme=parsed.state&&parsed.state.theme||'system';}catch(e){}}var prefersDark=window.matchMedia('(prefers-color-scheme:dark)').matches;var resolved=theme==='system'?(prefersDark?'dark':'light'):theme;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;if(theme==='system'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',theme)}}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Finance OS',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const quickEntryOpen = useQuickEntryStore((s) => s.open);
  const closeQuickEntry = useQuickEntryStore((s) => s.closeQuickEntry);
  const openQuickEntry = useQuickEntryStore((s) => s.openQuickEntry);

  // Global ⌘K handler — opens Quick Entry from any page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openQuickEntry();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openQuickEntry]);

  const handleQuickSuccess = () => {
    closeQuickEntry();
    // Re-fetch all route data so the current page reflects the new transaction
    router.invalidate();
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <AuthGuard>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pb-16 lg:ml-[240px] lg:pb-0">{children}</main>
          </div>
          <MobileNav />
        </AuthGuard>

        {/* Global Quick Entry — available from any page via ⌘K */}
        <QuickEntry
          open={quickEntryOpen}
          onClose={closeQuickEntry}
          onSuccess={handleQuickSuccess}
        />

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
