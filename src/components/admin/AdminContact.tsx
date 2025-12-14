import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { contactAPI } from '@/lib/api';
import { Save, Trash2, Mail, MailOpen, Phone, MapPin, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContactSettings {
  [key: string]: { value: string; value_fa: string };
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  product_id: number | null;
  product_name: string | null;
  read: boolean;
  created_at: string;
}

const AdminContact: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ContactSettings>({
    phone: { value: '', value_fa: '' },
    whatsapp: { value: '', value_fa: '' },
    email: { value: '', value_fa: '' },
    address: { value: '', value_fa: '' },
    working_hours: { value: '', value_fa: '' },
    map_url: { value: '', value_fa: '' },
  });
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsData, messagesData] = await Promise.all([
        contactAPI.getSettings(),
        contactAPI.getMessages(),
      ]);
      
      setSettings({
        phone: settingsData.phone || { value: '', value_fa: '' },
        whatsapp: settingsData.whatsapp || { value: '', value_fa: '' },
        email: settingsData.email || { value: '', value_fa: '' },
        address: settingsData.address || { value: '', value_fa: '' },
        working_hours: settingsData.working_hours || { value: '', value_fa: '' },
        map_url: settingsData.map_url || { value: '', value_fa: '' },
      });
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await contactAPI.updateSettings(settings);
      toast({
        title: 'ذخیره شد',
        description: 'تنظیمات تماس با موفقیت ذخیره شد',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در ذخیره تنظیمات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await contactAPI.markAsRead(id);
      setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در به‌روزرسانی پیام',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm('آیا از حذف این پیام مطمئن هستید؟')) return;
    
    try {
      await contactAPI.deleteMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      toast({
        title: 'حذف شد',
        description: 'پیام با موفقیت حذف شد',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در حذف پیام',
        variant: 'destructive',
      });
    }
  };

  const updateSetting = (key: string, field: 'value' | 'value_fa', newValue: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: newValue },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Tabs defaultValue="settings" className="space-y-6">
      <TabsList className="font-vazir">
        <TabsTrigger value="settings">تنظیمات تماس</TabsTrigger>
        <TabsTrigger value="messages" className="relative">
          پیام‌ها
          {unreadCount > 0 && (
            <Badge variant="destructive" className="mr-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle className="font-vazir">تنظیمات اطلاعات تماس</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  شماره تماس (انگلیسی)
                </Label>
                <Input
                  value={settings.phone?.value || ''}
                  onChange={(e) => updateSetting('phone', 'value', e.target.value)}
                  placeholder="+93 700 000 000"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-vazir">شماره تماس (فارسی)</Label>
                <Input
                  value={settings.phone?.value_fa || ''}
                  onChange={(e) => updateSetting('phone', 'value_fa', e.target.value)}
                  placeholder="۰۷۰۰ ۰۰۰ ۰۰۰"
                  className="font-vazir"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  شماره واتساپ (انگلیسی)
                </Label>
                <Input
                  value={settings.whatsapp?.value || ''}
                  onChange={(e) => updateSetting('whatsapp', 'value', e.target.value)}
                  placeholder="+93700000000"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-vazir">شماره واتساپ (فارسی)</Label>
                <Input
                  value={settings.whatsapp?.value_fa || ''}
                  onChange={(e) => updateSetting('whatsapp', 'value_fa', e.target.value)}
                  placeholder="۰۷۰۰۰۰۰۰۰۰۰"
                  className="font-vazir"
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  ایمیل
                </Label>
                <Input
                  value={settings.email?.value || ''}
                  onChange={(e) => updateSetting('email', 'value', e.target.value)}
                  placeholder="info@example.com"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-vazir">ایمیل (فارسی)</Label>
                <Input
                  value={settings.email?.value_fa || ''}
                  onChange={(e) => updateSetting('email', 'value_fa', e.target.value)}
                  className="font-vazir"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  آدرس (انگلیسی)
                </Label>
                <Input
                  value={settings.address?.value || ''}
                  onChange={(e) => updateSetting('address', 'value', e.target.value)}
                  placeholder="Kabul, Afghanistan"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-vazir">آدرس (فارسی)</Label>
                <Input
                  value={settings.address?.value_fa || ''}
                  onChange={(e) => updateSetting('address', 'value_fa', e.target.value)}
                  placeholder="کابل، افغانستان"
                  className="font-vazir"
                />
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  ساعات کاری (انگلیسی)
                </Label>
                <Input
                  value={settings.working_hours?.value || ''}
                  onChange={(e) => updateSetting('working_hours', 'value', e.target.value)}
                  placeholder="Sat - Thu: 9 AM - 6 PM"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-vazir">ساعات کاری (فارسی)</Label>
                <Input
                  value={settings.working_hours?.value_fa || ''}
                  onChange={(e) => updateSetting('working_hours', 'value_fa', e.target.value)}
                  placeholder="شنبه تا پنجشنبه: ۹ صبح تا ۶ عصر"
                  className="font-vazir"
                />
              </div>
            </div>

            {/* Map URL */}
            <div className="space-y-2">
              <Label className="font-vazir">لینک نقشه گوگل (embed URL)</Label>
              <Input
                value={settings.map_url?.value || ''}
                onChange={(e) => updateSetting('map_url', 'value', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                dir="ltr"
              />
            </div>

            <Button onClick={handleSaveSettings} disabled={saving} className="font-vazir gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              ذخیره تنظیمات
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="messages">
        <Card>
          <CardHeader>
            <CardTitle className="font-vazir">پیام‌های دریافتی</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-vazir">هیچ پیامی دریافت نشده است</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-vazir text-right">نام</TableHead>
                    <TableHead className="font-vazir text-right">تماس</TableHead>
                    <TableHead className="font-vazir text-right">پیام</TableHead>
                    <TableHead className="font-vazir text-right">محصول</TableHead>
                    <TableHead className="font-vazir text-right">تاریخ</TableHead>
                    <TableHead className="font-vazir text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id} className={!msg.read ? 'bg-primary/5' : ''}>
                      <TableCell className="font-vazir font-medium">
                        {msg.name}
                        {!msg.read && (
                          <Badge variant="secondary" className="mr-2 font-vazir">جدید</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {msg.email && <p>{msg.email}</p>}
                          {msg.phone && <p dir="ltr">{msg.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="font-vazir max-w-xs truncate">{msg.message}</TableCell>
                      <TableCell className="font-vazir">{msg.product_name || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(msg.created_at).toLocaleDateString('fa-IR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!msg.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(msg.id)}
                              title="خوانده شد"
                            >
                              <MailOpen className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </TabsContent>
    </Tabs>
  );
};

export default AdminContact;
