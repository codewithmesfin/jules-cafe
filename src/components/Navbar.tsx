"use client"

import { ChefHat, UtensilsCrossed } from "lucide-react"
import Link from "next/link"


export default function Navbar(){
    return <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm px-4 md:px-6 lg:px-8 py-4">
          <div className='flex items-center justify-between w-full max-w-7xl mx-auto'>
            <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
              <Link href={"/"} className="flex items-center gap-2 text-[#e60023] font-bold text-xl">
                <ChefHat size={32} />
                <span className="hidden sm:inline">Abc Cafe</span>
              </Link>
              <div className="hidden lg:flex items-center gap-8 font-semibold text-black">
                <Link href={'/use-cases'} className="hover:text-gray-600 transition-colors">Explore</Link>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6 lg:gap-8 font-semibold text-black">
              <div className="hidden md:flex items-center gap-4 lg:gap-8">
                <Link href={'/services'} className="hover:text-gray-600 transition-colors">Services</Link>
                <Link href={"/feature"} className="hover:text-gray-600 transition-colors">Feature</Link>
                <Link href={'/use-cases'} className="hover:text-gray-600 transition-colors">Use Cases</Link>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 lg:gap-3 ml-3">
                    <Link href={"/login"} className="bg-[#e60023] text-white px-4 md:px-5 py-2.5 rounded-full hover:bg-[#ad081b] transition-colors text-sm md:text-base font-bold">
                      Log in
                    </Link>
                    <Link href={"/signup"} className="bg-[#efefef] text-black px-4 md:px-5 py-2.5 rounded-full hover:bg-[#e2e2e2] transition-colors text-sm md:text-base font-bold whitespace-nowrap">
                      Sign up
                    </Link>
                  </div>
              </div>
            </div>
          </div>
        </nav>
}