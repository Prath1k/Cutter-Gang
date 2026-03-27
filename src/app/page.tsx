import { Nav } from "@/components/Nav";
import { VideoFeed } from "@/components/VideoFeed";
import { GlobalChat } from "@/components/GlobalChat";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden selection:bg-red-600/30">
      <Nav />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-white/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <VideoFeed />
      <GlobalChat />
    </main>
  );
}
