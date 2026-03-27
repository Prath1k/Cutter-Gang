import { supabase } from '@/lib/supabase';
import { VideoGrid } from '@/components/VideoGrid';

export async function VideoFeed() {
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  const displayItems = videos && videos.length > 0
    ? videos
    : Array.from({ length: 6 }).map((_, i) => ({
        id: `mock-${i}`,
        title: `Placeholder funny incident ${i + 1} with the gang`,
        url: null,
      }));

  return (
    <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <VideoGrid items={displayItems} />
    </section>
  );
}
