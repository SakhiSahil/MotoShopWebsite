import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { settingsAPI } from '@/lib/api';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

interface VideoData {
  url: string;
  title: string;
  titleFa: string;
}

const VideoSection: React.FC = () => {
  const { isRTL } = useLanguage();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [activeTab, setActiveTab] = useState('0');
  const [loading, setLoading] = useState(true);
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.15 });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const settings = await settingsAPI.getAll();
        const videoList: VideoData[] = [];
        
        // Only add videos that have valid URLs from database
        if (settings.video_1?.value) {
          videoList.push({
            url: settings.video_1.value,
            title: settings.video_1_title?.value || 'Video 1',
            titleFa: settings.video_1_title?.value_fa || 'ویدیو ۱'
          });
        }
        if (settings.video_2?.value) {
          videoList.push({
            url: settings.video_2.value,
            title: settings.video_2_title?.value || 'Video 2',
            titleFa: settings.video_2_title?.value_fa || 'ویدیو ۲'
          });
        }
        if (settings.video_3?.value) {
          videoList.push({
            url: settings.video_3.value,
            title: settings.video_3_title?.value || 'Video 3',
            titleFa: settings.video_3_title?.value_fa || 'ویدیو ۳'
          });
        }
        
        setVideos(videoList);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Play video when visible
  useEffect(() => {
    if (isVisible) {
      const activeIndex = parseInt(activeTab);
      if (videoRefs.current[activeIndex]) {
        videoRefs.current[activeIndex]?.play();
      }
    }
  }, [isVisible, activeTab]);

  const handleTabChange = (value: string) => {
    // Pause current video
    const currentIndex = parseInt(activeTab);
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.pause();
    }
    
    setActiveTab(value);
    
    // Play new video
    const newIndex = parseInt(value);
    setTimeout(() => {
      if (videoRefs.current[newIndex]) {
        videoRefs.current[newIndex]?.play();
      }
    }, 100);
  };

  // Don't render if no videos
  if (!loading && videos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={cn(
            "text-center mb-10",
            getAnimationClasses(isVisible, scrollDirection)
          )}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Play className="w-3 h-3 text-primary" />
            <span className={cn(
              "text-xs text-primary font-medium",
              isRTL ? "font-vazir" : "font-orbitron"
            )}>
              {isRTL ? 'ویدیوها' : 'Videos'}
            </span>
          </div>
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-foreground mb-2",
            isRTL ? "font-vazir" : "font-orbitron"
          )}>
            {isRTL ? 'ویدیوهای معرفی' : 'Introduction Videos'}
          </h2>
          <p className={cn(
            "text-muted-foreground text-sm max-w-md mx-auto",
            isRTL ? "font-vazir" : ""
          )}>
            {isRTL ? 'موتورسیکلت‌های ما را از نزدیک ببینید و با خدمات ما آشنا شوید' : 'Watch our motorcycles up close and learn about our services'}
          </p>
        </div>

        <div 
          className={cn(
            "max-w-5xl mx-auto",
            getAnimationClasses(isVisible, scrollDirection)
          )}
          style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} dir={isRTL ? 'rtl' : 'ltr'}>
            {videos.length > 1 && (
              <TabsList className={cn(
                "mb-6 bg-background/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl",
                videos.length === 2 ? "grid grid-cols-2" : "grid grid-cols-3"
              )}>
                {videos.map((video, index) => (
                  <TabsTrigger 
                    key={index} 
                    value={index.toString()}
                    className={cn(
                      "text-xs md:text-sm rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300",
                      isRTL ? "font-vazir" : "font-orbitron"
                    )}
                  >
                    {isRTL ? video.titleFa : video.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

            {videos.map((video, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-0">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-background border border-border/50">
                  <div className="aspect-video">
                    <video
                      ref={el => videoRefs.current[index] = el}
                      src={getImageUrl(video.url)}
                      className="w-full h-full object-cover"
                      autoPlay={index === parseInt(activeTab) && isVisible}
                      muted
                      loop
                      playsInline
                      controls
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
