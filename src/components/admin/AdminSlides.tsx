import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { slidesAPI } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2, Image, Video } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { VideoUpload } from "./VideoUpload";
import { getImageUrl } from "@/lib/imageUtils";

interface Slide {
  id: number;
  image: string;
  media_type: string;
  sort_order: number;
  active: number;
}

const emptySlide = {
  image: "",
  media_type: "image",
  sort_order: 0,
  active: true,
};

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState(emptySlide);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSlides = async () => {
    try {
      const data = await slidesAPI.getAllAdmin();
      setSlides(data);
    } catch (error) {
      toast({ title: "خطا در دریافت اسلایدها", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast({ title: "لطفا یک تصویر یا ویدیو انتخاب کنید", variant: "destructive" });
      return;
    }
    
    setSaving(true);

    try {
      const form = new FormData();
      form.append('image', formData.image);
      form.append('media_type', formData.media_type);
      form.append('sort_order', String(formData.sort_order));
      form.append('active', formData.active ? '1' : '0');

      if (editingSlide) {
        await slidesAPI.update(editingSlide.id, form);
        toast({ title: "اسلاید با موفقیت ویرایش شد" });
      } else {
        await slidesAPI.create(form);
        toast({ title: "اسلاید با موفقیت اضافه شد" });
      }

      setDialogOpen(false);
      setEditingSlide(null);
      setFormData(emptySlide);
      fetchSlides();
    } catch (error) {
      toast({ title: "خطا در ذخیره اسلاید", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;

    try {
      await slidesAPI.delete(id);
      toast({ title: "اسلاید با موفقیت حذف شد" });
      fetchSlides();
    } catch (error) {
      toast({ title: "خطا در حذف اسلاید", variant: "destructive" });
    }
  };

  const openEditDialog = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      image: slide.image,
      media_type: slide.media_type || 'image',
      sort_order: slide.sort_order,
      active: Boolean(slide.active),
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingSlide(null);
    setFormData(emptySlide);
    setDialogOpen(true);
  };

  const handleMediaTypeChange = (value: string) => {
    setFormData({ ...formData, media_type: value, image: "" });
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>مدیریت اسلایدر</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن اسلاید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? "ویرایش اسلاید" : "افزودن اسلاید جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Media Type Selection */}
              <div className="space-y-3">
                <Label>نوع رسانه</Label>
                <RadioGroup
                  value={formData.media_type}
                  onValueChange={handleMediaTypeChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="image" id="type-image" />
                    <Label htmlFor="type-image" className="flex items-center gap-1 cursor-pointer">
                      <Image className="w-4 h-4" />
                      تصویر
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="video" id="type-video" />
                    <Label htmlFor="type-video" className="flex items-center gap-1 cursor-pointer">
                      <Video className="w-4 h-4" />
                      ویدیو
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Image or Video Upload */}
              {formData.media_type === 'image' ? (
                <ImageUpload
                  label="تصویر اسلاید"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              ) : (
                <VideoUpload
                  label="ویدیو اسلاید"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ترتیب نمایش</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label>فعال</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {editingSlide ? "ذخیره تغییرات" : "افزودن اسلاید"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">پیش‌نمایش</TableHead>
              <TableHead className="text-right">نوع</TableHead>
              <TableHead className="text-right">ترتیب</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>
                  {slide.media_type === 'video' ? (
                    <video
                      src={getImageUrl(slide.image)}
                      className="w-24 h-14 object-cover rounded"
                      muted
                    />
                  ) : (
                    <img
                      src={getImageUrl(slide.image)}
                      alt="Slide"
                      className="w-24 h-14 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    {slide.media_type === 'video' ? (
                      <>
                        <Video className="w-4 h-4" />
                        ویدیو
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4" />
                        تصویر
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell>{slide.sort_order}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${slide.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {slide.active ? 'فعال' : 'غیرفعال'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(slide)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(slide.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {slides.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            هیچ اسلایدی یافت نشد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSlides;