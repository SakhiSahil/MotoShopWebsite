import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/imageUtils";
import { uploadAPI, getAuthToken } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface VideoUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}

// Helper to extract filename from URL
const getFilenameFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/uploads\/([^?#]+)/);
  return match ? match[1] : null;
};

// Check if URL is an external link (not uploaded file)
const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

// Check if URL is a local upload
const isLocalUpload = (url: string): boolean => {
  if (!url) return false;
  return url.includes('/uploads/');
};

// Check if URL is a YouTube link
const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Check if URL is a Vimeo link
const isVimeoUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('vimeo.com');
};

// Extract YouTube video ID
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Handle youtu.be format
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  
  // Handle youtube.com/watch format
  const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  
  // Handle youtube.com/embed format (already embed)
  if (url.includes('youtube.com/embed/')) return url;
  
  return null;
};

// Extract Vimeo video ID
const getVimeoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  return null;
};

export const VideoUpload = ({ label, value, onChange }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset local preview when value changes externally
  useEffect(() => {
    setLocalPreview(null);
    setVideoError(false);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های ویدیویی MP4، WebM و OGG مجاز هستند",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حداکثر حجم فایل ۱۰۰ مگابایت است",
        variant: "destructive",
      });
      return;
    }

    // Store old value to delete after successful upload
    const oldValue = value;
    
    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setVideoError(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      
      // Clean up local preview after successful upload
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
      
      // Delete old file from server if it exists, is different, and is a local upload
      if (oldValue && isLocalUpload(oldValue) && oldValue !== data.url) {
        const oldFilename = getFilenameFromUrl(oldValue);
        if (oldFilename) {
          try {
            await uploadAPI.deleteFile(oldFilename);
          } catch (e) {
            console.log('Could not delete old file:', e);
          }
        }
      }
      
      toast({
        title: "موفق",
        description: "ویدیو با موفقیت آپلود شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در آپلود ویدیو",
        variant: "destructive",
      });
      // Keep the local preview on error
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    // Only delete from server if it's a local upload
    if (isLocalUpload(value)) {
      const filename = getFilenameFromUrl(value);
      if (filename) {
        try {
          await uploadAPI.deleteFile(filename);
        } catch (e) {
          console.log('Could not delete file:', e);
        }
      }
    }
    
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setVideoError(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine which preview to show
  const displayUrl = localPreview || (value ? (isExternalUrl(value) ? value : getImageUrl(value)) : '');

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setLocalPreview(null);
            setVideoError(false);
          }}
          placeholder="آدرس ویدیو را وارد کنید یا آپلود کنید..."
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Preview section */}
      {displayUrl && !videoError ? (
        <div className="relative inline-block group">
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
            {isYouTubeUrl(value) ? (
              <iframe
                src={getYouTubeEmbedUrl(value) || ''}
                className="w-full max-w-md aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setVideoError(true)}
              />
            ) : isVimeoUrl(value) ? (
              <iframe
                src={getVimeoEmbedUrl(value) || ''}
                className="w-full max-w-md aspect-video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onError={() => setVideoError(true)}
              />
            ) : (
              <video
                src={displayUrl}
                className="w-full max-w-md aspect-video object-cover"
                controls
                preload="metadata"
                onError={() => setVideoError(true)}
              />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {localPreview && !uploading && (
              <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded">
                آپلود شد
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : videoError ? (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          <X className="w-4 h-4" />
          <span>خطا در بارگذاری ویدیو - لطفا آدرس را بررسی کنید</span>
        </div>
      ) : null}
    </div>
  );
};
