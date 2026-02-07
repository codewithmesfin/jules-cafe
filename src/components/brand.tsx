"use client"

import Image from "next/image";
import Link from "next/link";

interface PROPS {
  textColor?: string,
  logo?: string,
  imageOnly?: boolean
  size?: string
  fontSize?: string
  subtitle?: string
  subtitleColor?: string,
}

export default function Brand({ textColor = 'text-black',
  logo = "/logo.png", imageOnly = false, size = "size-12",
  fontSize = "text-lg md:text-xl", subtitleColor = "text-gray-700",
  subtitle }: PROPS) {
  return <Link href="/"
    className="flex space-x-1 items-center cursor-pointer"
  >
    <Image
      alt="Zihool"
      src={logo}
      className={`sm:w-auto object-contain rounded ${size}`}
      width={600} height={600}
    />
    {!imageOnly && <div>
      <h1 className={`brand tracking-[.25px] ${fontSize}`}>
        <span className={`${textColor}`}>Mevin Cafe</span>
      </h1>
      {subtitle && <h2 className={`${subtitleColor} font-medium text-sm`}>{subtitle}</h2>}
    </div>
    }
  </Link>
}