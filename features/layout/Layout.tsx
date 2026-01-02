import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalConfig } from '../../types';
import { Button } from '../../components/ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  config?: GlobalConfig;
}

export const Layout: React.FC<LayoutProps> = ({ children, config }) => {
  if (!config) return <div className="min-h-screen flex items-center justify-center">Loading Configuration...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight">{config.companyName}</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {config.navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex ml-4">
               <Button variant="default" size="sm">
                  {config.phone}
               </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-8 max-w-screen-2xl">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Genkit. Powered by Data.
          </p>
          <div className="text-sm text-muted-foreground">
             &copy; {new Date().getFullYear()} {config.companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
