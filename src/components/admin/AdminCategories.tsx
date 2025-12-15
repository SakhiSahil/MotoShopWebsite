import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { categoriesAPI } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";

interface Category {
  id: number;
  name: string;
  name_fa: string;
  value: string;
  sort_order: number;
  active: boolean;
}

const emptyCategory = {
  name: "",
  name_fa: "",
  value: "",
  sort_order: 0,
  active: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      toast({ title: "خطا در دریافت دسته‌بندی‌ها", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
        toast({ title: "دسته‌بندی با موفقیت ویرایش شد" });
      } else {
        await categoriesAPI.create(formData);
        toast({ title: "دسته‌بندی با موفقیت اضافه شد" });
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setFormData(emptyCategory);
      fetchCategories();
    } catch (error) {
      toast({ title: "خطا در ذخیره دسته‌بندی", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;

    try {
      await categoriesAPI.delete(id);
      toast({ title: "دسته‌بندی با موفقیت حذف شد" });
      await fetchCategories();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "خطا در حذف دسته‌بندی", variant: "destructive" });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_fa: category.name_fa,
      value: category.value,
      sort_order: category.sort_order,
      active: category.active,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCategory(null);
    setFormData({
      ...emptyCategory,
      sort_order: categories.length,
    });
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
        <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن دسته‌بندی
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>نام (انگلیسی)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sport"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>نام (فارسی)</Label>
                <Input
                  value={formData.name_fa}
                  onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                  placeholder="اسپرت"
                  required
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>مقدار (برای فیلتر)</Label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="sport"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  این مقدار برای فیلتر کردن استفاده می‌شود. فقط حروف انگلیسی کوچک و خط تیره
                </p>
              </div>
              <div className="space-y-2">
                <Label>ترتیب نمایش</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>فعال</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {editingCategory ? "ذخیره تغییرات" : "افزودن دسته‌بندی"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-12">ترتیب</TableHead>
              <TableHead className="text-right">نام (انگلیسی)</TableHead>
              <TableHead className="text-right">نام (فارسی)</TableHead>
              <TableHead className="text-right">مقدار</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  {category.sort_order}
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.name_fa}</TableCell>
                <TableCell>
                  <code className="bg-muted px-1 py-0.5 rounded text-sm">{category.value}</code>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.active ? 'فعال' : 'غیرفعال'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            هیچ دسته‌بندی یافت نشد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCategories;
