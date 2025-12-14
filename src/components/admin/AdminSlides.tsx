import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { slidesAPI } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { getImageUrl } from "@/lib/imageUtils";

interface Slide {
  id: number;
  title: string;
  title_fa: string;
  subtitle: string;
  subtitle_fa: string;
  image: string;
  button_text: string;
  button_text_fa: string;
  button_link: string;
  sort_order: number;
  active: number;
}

const emptySlide = {
  title: "", title_fa: "", subtitle: "", subtitle_fa: "",
  image: "", button_text: "", button_text_fa: "", button_link: "",
  sort_order: 0, active: true,
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
    setSaving(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          form.append(key, value ? '1' : '0');
        } else {
          form.append(key, String(value));
        }
      });

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
      title: slide.title,
      title_fa: slide.title_fa,
      subtitle: slide.subtitle,
      subtitle_fa: slide.subtitle_fa,
      image: slide.image,
      button_text: slide.button_text || '',
      button_text_fa: slide.button_text_fa || '',
      button_link: slide.button_link || '',
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? "ویرایش اسلاید" : "افزودن اسلاید جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عنوان (انگلیسی)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان (فارسی)</Label>
                  <Input
                    value={formData.title_fa}
                    onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>زیرعنوان (انگلیسی)</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>زیرعنوان (فارسی)</Label>
                  <Input
                    value={formData.subtitle_fa}
                    onChange={(e) => setFormData({ ...formData, subtitle_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>متن دکمه (انگلیسی)</Label>
                  <Input
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>متن دکمه (فارسی)</Label>
                  <Input
                    value={formData.button_text_fa}
                    onChange={(e) => setFormData({ ...formData, button_text_fa: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <ImageUpload
                label="تصویر اسلاید"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                required
              />

              <div className="space-y-2">
                <Label>لینک دکمه</Label>
                <Input
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  placeholder="/products"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ترتیب نمایش</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
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
              <TableHead className="text-right">تصویر</TableHead>
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">ترتیب</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>
                  <img
                    src={getImageUrl(slide.image)}
                    alt={slide.title}
                    className="w-24 h-14 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{slide.title_fa}</TableCell>
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
