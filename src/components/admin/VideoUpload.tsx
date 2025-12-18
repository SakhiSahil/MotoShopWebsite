import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/imageUtils";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface VideoUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}

export const VideoUpload = ({ label, value, onChange }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
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
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const videoUrl = value ? getImageUrl(value) : '';

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <video 
            src={videoUrl} 
            className="w-full aspect-video object-cover"
            controls
            preload="metadata"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">در حال آپلود...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Video className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">کلیک کنید یا فایل را بکشید</span>
              <span className="text-xs text-muted-foreground">MP4, WebM, OGG - حداکثر ۱۰۰ مگابایت</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
