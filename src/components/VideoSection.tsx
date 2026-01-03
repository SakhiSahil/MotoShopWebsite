import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { videosAPI } from '@/lib/api';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

interface Video {
  id: number;
  url: string;
  title: string;
  title_fa: string;
  sort_order: number;
  active: number;
}

// Helper functions for YouTube/Vimeo detection
const isYouTubeUrl = (url: string): boolean => {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(url);
};

const isVimeoUrl = (url: string): boolean => {
  return /(?:vimeo\.com\/)/.test(url);
};

const getYouTubeEmbedUrl = (url: string): string => {
  let videoId = '';
  
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }
  
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }
  
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    videoId = shortsMatch[1];
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}` : url;
};

const getVimeoEmbedUrl = (url: string): string => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1`;
  }
  return url;
};

const isExternalVideoUrl = (url: string): boolean => {
  return isYouTubeUrl(url) || isVimeoUrl(url);
};

const VideoSection: React.FC = () => {
  const { isRTL } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState('0');
  const [loading, setLoading] = useState(true);
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.15 });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await videosAPI.getAll();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Play video when visible (only for local videos)
  useEffect(() => {
    if (isVisible) {
      const activeIndex = parseInt(activeTab);
      const activeVideo = videos[activeIndex];
      if (activeVideo && !isExternalVideoUrl(activeVideo.url) && videoRefs.current[activeIndex]) {
        videoRefs.current[activeIndex]?.play();
      }
    }
  }, [isVisible, activeTab, videos]);

  const handleTabChange = (value: string) => {
    // Pause current video (only for local videos)
    const currentIndex = parseInt(activeTab);
    const currentVideo = videos[currentIndex];
    if (currentVideo && !isExternalVideoUrl(currentVideo.url) && videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.pause();
    }
    
    setActiveTab(value);
    
    // Play new video (only for local videos)
    const newIndex = parseInt(value);
    const newVideo = videos[newIndex];
    setTimeout(() => {
      if (newVideo && !isExternalVideoUrl(newVideo.url) && videoRefs.current[newIndex]) {
        videoRefs.current[newIndex]?.play();
      }
    }, 100);
  };

  const getVideoEmbedUrl = (url: string): string => {
    if (isYouTubeUrl(url)) {
      return getYouTubeEmbedUrl(url);
    }
    if (isVimeoUrl(url)) {
      return getVimeoEmbedUrl(url);
    }
    return url;
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
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {isRTL ? 'ویدیوها' : 'Videos'}
            </span>
          </div>

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
                "mb-6 bg-transparent border-none p-0 gap-6 h-auto",
                "flex justify-center"
              )}>
                {videos.map((video, index) => (
                  <TabsTrigger 
                    key={video.id} 
                    value={index.toString()}
                    className={cn(
                      "relative text-sm md:text-base py-2 px-1 bg-transparent border-none rounded-none shadow-none",
                      "text-muted-foreground hover:text-primary transition-colors duration-300",
                      "data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
                      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5",
                      "after:bg-primary after:scale-x-0 after:origin-center after:transition-transform after:duration-300",
                      "data-[state=active]:after:scale-x-100",
                      isRTL ? "font-vazir" : "font-poppins"
                    )}
                  >
                    {isRTL ? video.title_fa : video.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

            {videos.map((video, index) => (
              <TabsContent key={video.id} value={index.toString()} className="mt-0">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-background border border-border/50">
                  <div className="aspect-video">
                    {isExternalVideoUrl(video.url) ? (
                      <iframe
                        src={getVideoEmbedUrl(video.url)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={isRTL ? video.title_fa : video.title}
                      />
                    ) : (
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
                    )}
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
