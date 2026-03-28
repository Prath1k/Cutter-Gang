import Link from 'next/link';
import { User } from 'lucide-react';
import { UploadVideo } from '@/components/UploadVideo';

export function Navigation() {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
      <div className="bg-white text-black rounded-full px-8 py-4 flex items-center justify-between shadow-2xl">
        <nav className="hidden md:flex items-center gap-8 font-semibold">
          <Link href="/" className="hover:text-red-600 transition-colors">Feed</Link>
          <Link href="/gang" className="hover:text-red-600 transition-colors">The Gang</Link>
        </nav>
        
        <div className="text-2xl font-black tracking-tighter uppercase relative">
          CutterGang<span className="text-red-600 ml-1 text-3xl leading-none">*</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <UploadVideo />
          
          <button className="hover:text-red-600 transition-colors font-semibold flex items-center gap-2 text-black">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="hidden sm:inline">Online</span>
          </button>
          
          <button className="hover:text-red-600 transition-colors text-black">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
