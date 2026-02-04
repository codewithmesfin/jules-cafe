"use client"

import { ChefHat } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/cn"

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className='flex items-center justify-between w-full max-w-7xl mx-auto'>
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2.5 text-slate-900 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <ChefHat size={24} />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Quick Serve</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Features', path: '/features' },
              { label: 'Use Cases', path: '/use-cases' },
              { label: 'Pricing', path: '#' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-primary",
                  pathname === item.path ? "text-primary" : "text-slate-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-bold text-slate-600 hover:text-primary transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 text-sm font-bold active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}