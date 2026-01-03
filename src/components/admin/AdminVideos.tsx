import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { videosAPI } from "@/lib/api";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { getImageUrl } from "@/lib/imageUtils";

interface Video {
  id: number;
  url: string;
  title: string;
  title_fa: string;
  sort_order: number;
  active: number;
}

const emptyVideo: Omit<Video, 'id'> = {
  url: '',
  title: '',
  title_fa: '',
  sort_order: 0,
  active: 1,
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<Omit<Video, 'id'>>(emptyVideo);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      const data = await videosAPI.getAllAdmin();
      setVideos(data);
    } catch (error) {
      toast({ title: "خطا در دریافت ویدیوها", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('url', formData.url);
      data.append('title', formData.title);
      data.append('title_fa', formData.title_fa);
      data.append('sort_order', formData.sort_order.toString());
      data.append('active', formData.active ? '1' : '0');

      if (editingVideo) {
        await videosAPI.update(editingVideo.id, data);
        toast({ title: "ویدیو با موفقیت ویرایش شد" });
      } else {
        await videosAPI.create(data);
        toast({ title: "ویدیو با موفقیت اضافه شد" });
      }

      setDialogOpen(false);
      setEditingVideo(null);
      setFormData(emptyVideo);
      fetchVideos();
    } catch (error) {
      toast({ title: "خطا در ذخیره ویدیو", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این ویدیو اطمینان دارید؟')) return;

    try {
      await videosAPI.delete(id);
      toast({ title: "ویدیو با موفقیت حذف شد" });
      fetchVideos();
    } catch (error) {
      toast({ title: "خطا در حذف ویدیو", variant: "destructive" });
    }
  };

  const openEditDialog = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      url: video.url,
      title: video.title,
      title_fa: video.title_fa,
      sort_order: video.sort_order,
      active: video.active,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingVideo(null);
    setFormData(emptyVideo);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>مدیریت ویدیوها</CardTitle>
          <CardDescription>ویدیوهای نمایش داده شده در صفحه اصلی سایت</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن ویدیو
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'ویرایش ویدیو' : 'افزودن ویدیو جدید'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <VideoUpload
                label="فایل ویدیو"
                value={formData.url}
                onChange={(url) => setFormData(prev => ({ ...prev, url }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عنوان (انگلیسی)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Video Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان (فارسی)</Label>
                  <Input
                    value={formData.title_fa}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_fa: e.target.value }))}
                    placeholder="عنوان ویدیو"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ترتیب نمایش</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.active === 1}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked ? 1 : 0 }))}
                  />
                  <Label>فعال</Label>
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {editingVideo ? 'ویرایش' : 'افزودن'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            هنوز ویدیویی اضافه نشده است
          </div>
        ) : (
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">پیش‌نمایش</TableHead>
                <TableHead className="text-right">عنوان</TableHead>
                <TableHead className="text-right">ترتیب</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    {video.url && (
                      <video
                        src={getImageUrl(video.url)}
                        className="w-24 h-16 object-cover rounded"
                        muted
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{video.title || '-'}</div>
                      <div className="text-sm text-muted-foreground" dir="rtl">{video.title_fa || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{video.sort_order}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${video.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {video.active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(video)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(video.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminVideos;
