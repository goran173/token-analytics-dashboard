'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold tracking-tight">
            Token Analytics
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
