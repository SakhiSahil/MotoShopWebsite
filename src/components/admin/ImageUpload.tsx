import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2, Eye } from "lucide-react";
import { getAuthToken } from "@/lib/api";
import { getImageUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}

export const ImageUpload = ({ label, value, onChange, required }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset local preview when value changes externally
  useEffect(() => {
    setLocalPreview(null);
    setImageError(false);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setImageError(false);
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.url) {
        onChange(result.url);
        // Clean up local preview after successful upload
        URL.revokeObjectURL(objectUrl);
        setLocalPreview(null);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Keep the local preview on error so user can see what they tried to upload
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setImageError(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine which preview to show
  const displayUrl = localPreview || (value ? getImageUrl(value) : '');

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setLocalPreview(null);
            setImageError(false);
          }}
          placeholder="آدرس تصویر یا آپلود کنید..."
          required={required && !value}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
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
      {displayUrl && !imageError ? (
        <div className="relative inline-block group">
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={displayUrl}
              alt="Preview"
              className="w-40 h-32 object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {localPreview && !uploading && (
              <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded">
                در حال آپلود...
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
      ) : imageError ? (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          <X className="w-4 h-4" />
          <span>خطا در بارگذاری تصویر - لطفا آدرس را بررسی کنید</span>
        </div>
      ) : null}
    </div>
  );
};

interface MultiImageUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export const MultiImageUpload = ({ label, value, onChange }: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<{ url: string; uploading: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Create local previews immediately
    const newPreviews = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      uploading: true,
    }));
    setLocalPreviews(prev => [...prev, ...newPreviews]);
    setUploading(true);

    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (result.url) {
          newUrls.push(result.url);
          // Clean up the local preview for this file
          URL.revokeObjectURL(newPreviews[i].url);
        }
      }

      onChange([...value, ...newUrls]);
      setLocalPreviews([]);
    } catch (error) {
      console.error('Upload failed:', error);
      // Mark local previews as failed
      setLocalPreviews(prev => prev.map(p => ({ ...p, uploading: false })));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleRemoveLocalPreview = (index: number) => {
    URL.revokeObjectURL(localPreviews[index].url);
    setLocalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              در حال آپلود...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 ml-2" />
              افزودن تصاویر
            </>
          )}
        </Button>
      </div>

      {/* Images grid */}
      {(value.length > 0 || localPreviews.length > 0) && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {/* Uploaded images */}
          {value.map((url, index) => (
            <div key={`uploaded-${index}`} className="relative group aspect-square">
              <img
                src={getImageUrl(url)}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {/* Local previews (uploading) */}
          {localPreviews.map((preview, index) => (
            <div key={`local-${index}`} className="relative group aspect-square">
              <img
                src={preview.url}
                alt={`Uploading ${index + 1}`}
                className={cn(
                  "w-full h-full object-cover rounded-lg border border-border",
                  preview.uploading && "opacity-50"
                )}
              />
              {preview.uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveLocalPreview(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && localPreviews.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">کلیک کنید یا تصاویر را اینجا رها کنید</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
