import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { ImageUpload, MultiImageUpload } from "./ImageUpload";
import { getImageUrl } from "@/lib/imageUtils";

interface Product {
  id: string;
  name: string;
  name_fa: string;
  brand: string;
  brand_fa: string;
  category: string;
  category_fa: string;
  price: string;
  price_fa: string;
  year: string;
  year_fa: string;
  engine: string;
  engine_fa: string;
  power: string;
  power_fa: string;
  top_speed: string;
  top_speed_fa: string;
  weight: string;
  weight_fa: string;
  fuel_capacity: string;
  fuel_capacity_fa: string;
  description: string;
  description_fa: string;
  image: string;
  gallery: string[];
  featured: boolean;
  inStock: boolean;
}

const emptyProduct: Omit<Product, 'id'> = {
  name: "", name_fa: "", brand: "", brand_fa: "",
  category: "", category_fa: "", price: "", price_fa: "",
  year: "", year_fa: "",
  engine: "", engine_fa: "", power: "", power_fa: "",
  top_speed: "", top_speed_fa: "", weight: "", weight_fa: "",
  fuel_capacity: "", fuel_capacity_fa: "", description: "", description_fa: "",
  image: "", gallery: [], featured: false, inStock: true,
};

interface Category {
  id: number;
  name: string;
  name_fa: string;
  value: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast({ title: "خطا در دریافت محصولات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'gallery') {
          form.append(key, JSON.stringify(value));
        } else if (key === 'inStock') {
          // Send both inStock and in_stock for backend compatibility
          form.append('inStock', value ? 'true' : 'false');
          form.append('in_stock', value ? 'true' : 'false');
        } else if (key === 'featured') {
          form.append('featured', value ? 'true' : 'false');
        } else if (typeof value === 'boolean') {
          form.append(key, value ? 'true' : 'false');
        } else {
          form.append(key, String(value));
        }
      });

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, form);
        toast({ title: "محصول با موفقیت ویرایش شد" });
      } else {
        await productsAPI.create(form);
        toast({ title: "محصول با موفقیت اضافه شد" });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setFormData(emptyProduct);
      fetchProducts();
    } catch (error) {
      toast({ title: "خطا در ذخیره محصول", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئن هستید؟")) return;

    try {
      await productsAPI.delete(id);
      toast({ title: "محصول با موفقیت حذف شد" });
      fetchProducts();
    } catch (error) {
      toast({ title: "خطا در حذف محصول", variant: "destructive" });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_fa: product.name_fa,
      brand: product.brand,
      brand_fa: product.brand_fa,
      category: product.category,
      category_fa: product.category_fa,
      price: product.price,
      price_fa: product.price_fa,
      year: product.year || '',
      year_fa: product.year_fa || '',
      engine: product.engine,
      engine_fa: product.engine_fa,
      power: product.power,
      power_fa: product.power_fa,
      top_speed: product.top_speed,
      top_speed_fa: product.top_speed_fa,
      weight: product.weight,
      weight_fa: product.weight_fa,
      fuel_capacity: product.fuel_capacity,
      fuel_capacity_fa: product.fuel_capacity_fa,
      description: product.description,
      description_fa: product.description_fa,
      image: product.image,
      gallery: product.gallery,
      featured: product.featured,
      inStock: product.inStock,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
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
        <CardTitle>مدیریت محصولات</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن محصول
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="space-y-2">
                  <Label>برند (انگلیسی)</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>برند (فارسی)</Label>
                  <Input
                    value={formData.brand_fa}
                    onChange={(e) => setFormData({ ...formData, brand_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>دسته‌بندی</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const cat = categories.find(c => c.value === value);
                      setFormData({
                        ...formData,
                        category: value,
                        category_fa: cat?.name_fa || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.value}>
                          {cat.name_fa} ({cat.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>دسته‌بندی (فارسی)</Label>
                  <Input
                    value={formData.category_fa}
                    onChange={(e) => setFormData({ ...formData, category_fa: e.target.value })}
                    required
                    dir="rtl"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>قیمت (انگلیسی)</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>قیمت (فارسی)</Label>
                  <Input
                    value={formData.price_fa}
                    onChange={(e) => setFormData({ ...formData, price_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سال تولید (انگلیسی)</Label>
                  <Input
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سال تولید (فارسی)</Label>
                  <Input
                    value={formData.year_fa}
                    onChange={(e) => setFormData({ ...formData, year_fa: e.target.value })}
                    placeholder="۲۰۲۴"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>موتور (انگلیسی)</Label>
                  <Input
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>موتور (فارسی)</Label>
                  <Input
                    value={formData.engine_fa}
                    onChange={(e) => setFormData({ ...formData, engine_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>قدرت (انگلیسی)</Label>
                  <Input
                    value={formData.power}
                    onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>قدرت (فارسی)</Label>
                  <Input
                    value={formData.power_fa}
                    onChange={(e) => setFormData({ ...formData, power_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سرعت (انگلیسی)</Label>
                  <Input
                    value={formData.top_speed}
                    onChange={(e) => setFormData({ ...formData, top_speed: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>سرعت (فارسی)</Label>
                  <Input
                    value={formData.top_speed_fa}
                    onChange={(e) => setFormData({ ...formData, top_speed_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>وزن (انگلیسی)</Label>
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>وزن (فارسی)</Label>
                  <Input
                    value={formData.weight_fa}
                    onChange={(e) => setFormData({ ...formData, weight_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ظرفیت سوخت (انگلیسی)</Label>
                  <Input
                    value={formData.fuel_capacity}
                    onChange={(e) => setFormData({ ...formData, fuel_capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>ظرفیت سوخت (فارسی)</Label>
                  <Input
                    value={formData.fuel_capacity_fa}
                    onChange={(e) => setFormData({ ...formData, fuel_capacity_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              <ImageUpload
                label="تصویر اصلی"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                required
              />

              <MultiImageUpload
                label="گالری تصاویر"
                value={formData.gallery}
                onChange={(urls) => setFormData({ ...formData, gallery: urls })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>توضیحات (انگلیسی)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>توضیحات (فارسی)</Label>
                  <Textarea
                    value={formData.description_fa}
                    onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label>ویژه</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                  />
                  <Label>موجود</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {editingProduct ? "ذخیره تغییرات" : "افزودن محصول"}
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
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">برند</TableHead>
              <TableHead className="text-right">قیمت</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{product.name_fa}</TableCell>
                <TableCell>{product.brand_fa}</TableCell>
                <TableCell>{product.price_fa}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.inStock ? 'موجود' : 'ناموجود'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            هیچ محصولی یافت نشد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminProducts;
