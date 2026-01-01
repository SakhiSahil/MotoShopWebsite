import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { settingsAPI } from "@/lib/api";
import { Loader2, Save } from "lucide-react";
import { VideoUpload } from "./VideoUpload";

interface Settings {
  [key: string]: { value: string; value_fa: string };
}

const AdminVideos = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const data = await settingsAPI.getAll();
      setSettings(data);
    } catch (error) {
      toast({ title: "خطا در دریافت تنظیمات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.updateAll(settings);
      toast({ title: "ویدیوها با موفقیت ذخیره شد" });
    } catch (error) {
      toast({ title: "خطا در ذخیره ویدیوها", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, field: 'value' | 'value_fa', newValue: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: newValue,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت ویدیوها</CardTitle>
        <CardDescription>ویدیوهای نمایش داده شده در صفحه اصلی سایت</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video 1 */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-4">ویدیو ۱</h3>
              <div className="space-y-4">
                <VideoUpload
                  label="فایل ویدیو"
                  value={settings.video_1?.value || ''}
                  onChange={(url) => updateSetting('video_1', 'value', url)}
                />
                <div className="space-y-2">
                  <Label>عنوان (انگلیسی)</Label>
                  <Input
                    value={settings.video_1_title?.value || ''}
                    onChange={(e) => updateSetting('video_1_title', 'value', e.target.value)}
                    placeholder="Video 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان (فارسی)</Label>
                  <Input
                    value={settings.video_1_title?.value_fa || ''}
                    onChange={(e) => updateSetting('video_1_title', 'value_fa', e.target.value)}
                    placeholder="ویدیو ۱"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Video 2 */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-4">ویدیو ۲</h3>
              <div className="space-y-4">
                <VideoUpload
                  label="فایل ویدیو"
                  value={settings.video_2?.value || ''}
                  onChange={(url) => updateSetting('video_2', 'value', url)}
                />
                <div className="space-y-2">
                  <Label>عنوان (انگلیسی)</Label>
                  <Input
                    value={settings.video_2_title?.value || ''}
                    onChange={(e) => updateSetting('video_2_title', 'value', e.target.value)}
                    placeholder="Video 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان (فارسی)</Label>
                  <Input
                    value={settings.video_2_title?.value_fa || ''}
                    onChange={(e) => updateSetting('video_2_title', 'value_fa', e.target.value)}
                    placeholder="ویدیو ۲"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Video 3 */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-4">ویدیو ۳</h3>
              <div className="space-y-4">
                <VideoUpload
                  label="فایل ویدیو"
                  value={settings.video_3?.value || ''}
                  onChange={(url) => updateSetting('video_3', 'value', url)}
                />
                <div className="space-y-2">
                  <Label>عنوان (انگلیسی)</Label>
                  <Input
                    value={settings.video_3_title?.value || ''}
                    onChange={(e) => updateSetting('video_3_title', 'value', e.target.value)}
                    placeholder="Video 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان (فارسی)</Label>
                  <Input
                    value={settings.video_3_title?.value_fa || ''}
                    onChange={(e) => updateSetting('video_3_title', 'value_fa', e.target.value)}
                    placeholder="ویدیو ۳"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
            ذخیره ویدیوها
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminVideos;