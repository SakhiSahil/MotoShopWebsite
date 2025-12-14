import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { brandsAPI } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { getImageUrl } from "@/lib/imageUtils";

interface Brand {
  id: number;
  name: string;
  name_fa: string;
  logo: string;
  active: number;
}

const emptyBrand = {
  name: "", name_fa: "", logo: "", active: true,
};

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState(emptyBrand);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchBrands = async () => {
    try {
      const data = await brandsAPI.getAllAdmin();
      setBrands(data);
    } catch (error) {
      toast({ title: "خطا در دریافت برندها", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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

      if (editingBrand) {
        await brandsAPI.update(editingBrand.id, form);
        toast({ title: "برند با موفقیت ویرایش شد" });
      } else {
        await brandsAPI.create(form);
        toast({ title: "برند با موفقیت اضافه شد" });
      }

      setDialogOpen(false);
      setEditingBrand(null);
      setFormData(emptyBrand);
      fetchBrands();
    } catch (error) {
      toast({ title: "خطا در ذخیره برند", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;

    try {
      await brandsAPI.delete(id);
      toast({ title: "برند با موفقیت حذف شد" });
      fetchBrands();
    } catch (error) {
      toast({ title: "خطا در حذف برند", variant: "destructive" });
    }
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      name_fa: brand.name_fa,
      logo: brand.logo,
      active: Boolean(brand.active),
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingBrand(null);
    setFormData(emptyBrand);
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
        <CardTitle>مدیریت برندها</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن برند
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "ویرایش برند" : "افزودن برند جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام (انگلیسی)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>نام (فارسی)</Label>
                  <Input
                    value={formData.name_fa}
                    onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              <ImageUpload
                label="لوگوی برند"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                required
              />

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>فعال</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {editingBrand ? "ذخیره تغییرات" : "افزودن برند"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">لوگو</TableHead>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <img
                    src={getImageUrl(brand.logo)}
                    alt={brand.name}
                    className="w-16 h-10 object-contain"
                  />
                </TableCell>
                <TableCell>{brand.name_fa}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${brand.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {brand.active ? 'فعال' : 'غیرفعال'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(brand)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {brands.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            هیچ برندی یافت نشد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBrands;
