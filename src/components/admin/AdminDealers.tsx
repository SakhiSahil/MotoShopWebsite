import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { dealersAPI } from '@/lib/api';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface Dealer {
  id: number;
  name: string;
  name_fa: string;
  address: string;
  address_fa: string;
  city: string;
  city_fa: string;
  phone: string;
  email: string;
  hours: string;
  hours_fa: string;
  map_url: string;
  sort_order: number;
  active: boolean;
}

const AdminDealers = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_fa: '',
    address: '',
    address_fa: '',
    city: '',
    city_fa: '',
    phone: '',
    email: '',
    hours: '',
    hours_fa: '',
    map_url: '',
    sort_order: 0,
    active: true,
  });
  const { toast } = useToast();

  const fetchDealers = async () => {
    try {
      const data = await dealersAPI.getAllAdmin();
      setDealers(data.map((d: any) => ({ ...d, active: Boolean(d.active) })));
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'دریافت نمایندگی‌ها با خطا مواجه شد',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      name_fa: '',
      address: '',
      address_fa: '',
      city: '',
      city_fa: '',
      phone: '',
      email: '',
      hours: '',
      hours_fa: '',
      map_url: '',
      sort_order: 0,
      active: true,
    });
    setEditingDealer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDealer) {
        await dealersAPI.update(editingDealer.id, formData);
        toast({ title: 'موفق', description: 'نمایندگی با موفقیت ویرایش شد' });
      } else {
        await dealersAPI.create(formData);
        toast({ title: 'موفق', description: 'نمایندگی با موفقیت اضافه شد' });
      }
      setDialogOpen(false);
      resetForm();
      fetchDealers();
    } catch (error) {
      toast({
        title: 'خطا',
        description: error instanceof Error ? error.message : 'عملیات با خطا مواجه شد',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      name_fa: dealer.name_fa,
      address: dealer.address,
      address_fa: dealer.address_fa,
      city: dealer.city || '',
      city_fa: dealer.city_fa || '',
      phone: dealer.phone,
      email: dealer.email,
      hours: dealer.hours,
      hours_fa: dealer.hours_fa,
      map_url: dealer.map_url || '',
      sort_order: dealer.sort_order,
      active: dealer.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این نمایندگی اطمینان دارید؟')) return;

    try {
      await dealersAPI.delete(id);
      toast({ title: 'موفق', description: 'نمایندگی با موفقیت حذف شد' });
      fetchDealers();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'حذف نمایندگی با خطا مواجه شد',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (dealer: Dealer) => {
    try {
      await dealersAPI.update(dealer.id, { active: !dealer.active });
      fetchDealers();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'تغییر وضعیت با خطا مواجه شد',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          مدیریت نمایندگی‌ها
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              افزودن نمایندگی
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDealer ? 'ویرایش نمایندگی' : 'افزودن نمایندگی جدید'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام (انگلیسی)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Kabul Dealership"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>نام (فارسی)</Label>
                  <Input
                    value={formData.name_fa}
                    onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                    placeholder="نمایندگی کابل"
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>آدرس (انگلیسی)</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Kabul, Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label>آدرس (فارسی)</Label>
                  <Input
                    value={formData.address_fa}
                    onChange={(e) => setFormData({ ...formData, address_fa: e.target.value })}
                    placeholder="کابل، خیابان اصلی"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>شهر (انگلیسی)</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kabul"
                  />
                </div>
                <div className="space-y-2">
                  <Label>شهر (فارسی)</Label>
                  <Input
                    value={formData.city_fa}
                    onChange={(e) => setFormData({ ...formData, city_fa: e.target.value })}
                    placeholder="کابل"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تلفن</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+93-799-123456"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ایمیل</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@dealer.af"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ساعات کاری (انگلیسی)</Label>
                  <Input
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="Sat-Thu: 8 AM - 6 PM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ساعات کاری (فارسی)</Label>
                  <Input
                    value={formData.hours_fa}
                    onChange={(e) => setFormData({ ...formData, hours_fa: e.target.value })}
                    placeholder="شنبه تا پنجشنبه: ۸ صبح - ۶ عصر"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>لینک نقشه گوگل (embed URL)</Label>
                <Input
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  برای دریافت لینک: در گوگل مپ مکان را پیدا کنید → Share → Embed a map → کپی src
                </p>
              </div>

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

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  انصراف
                </Button>
                <Button type="submit">
                  {editingDealer ? 'ذخیره تغییرات' : 'افزودن'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {dealers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            هنوز نمایندگی‌ای اضافه نشده است
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>آدرس</TableHead>
                <TableHead>تلفن</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dealer.name_fa}</div>
                      <div className="text-sm text-muted-foreground">{dealer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{dealer.address_fa || dealer.address || '-'}</div>
                  </TableCell>
                  <TableCell dir="ltr" className="text-left">
                    {dealer.phone || '-'}
                  </TableCell>
                  <TableCell dir="ltr" className="text-left">
                    {dealer.email || '-'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={dealer.active}
                      onCheckedChange={() => toggleActive(dealer)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(dealer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(dealer.id)}>
                        <Trash2 className="w-4 h-4" />
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

export default AdminDealers;
