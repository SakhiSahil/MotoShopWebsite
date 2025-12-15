import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { settingsAPI, authAPI, faqAPI } from "@/lib/api";
import { Loader2, Save, Settings, BarChart3, Lock, HelpCircle, Plus, Pencil, Trash2, Image, Video, Users, Bike, Award, Clock, Wrench, MapPin, Star, Shield, GripVertical } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { VideoUpload } from "./VideoUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Settings {
  [key: string]: { value: string; value_fa: string };
}

interface FAQ {
  id: number;
  question: string;
  question_fa: string;
  answer: string;
  answer_fa: string;
  sort_order: number;
  active: boolean;
}

interface Stat {
  id: number;
  label: string;
  label_fa: string;
  value: string;
  icon: string;
  sort_order: number;
}

const siteSettingsFields = [
  { key: 'site_name', label: 'نام سایت', type: 'input' },
  { key: 'instagram', label: 'لینک اینستاگرام', type: 'input', placeholder: 'https://instagram.com/yourpage' },
  { key: 'facebook', label: 'لینک فیسبوک', type: 'input', placeholder: 'https://facebook.com/yourpage' },
  { key: 'twitter', label: 'لینک توییتر/X', type: 'input', placeholder: 'https://twitter.com/yourpage' },
  { key: 'youtube', label: 'لینک یوتیوب', type: 'input', placeholder: 'https://youtube.com/yourchannel' },
  { key: 'footer_text', label: 'متن فوتر', type: 'textarea' },
];

const iconOptions = [
  { value: 'users', label: 'کاربران', icon: Users },
  { value: 'bike', label: 'موتورسیکلت', icon: Bike },
  { value: 'award', label: 'جایزه', icon: Award },
  { value: 'clock', label: 'زمان', icon: Clock },
  { value: 'wrench', label: 'ابزار', icon: Wrench },
  { value: 'mappin', label: 'مکان', icon: MapPin },
  { value: 'star', label: 'ستاره', icon: Star },
  { value: 'shield', label: 'سپر', icon: Shield },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Stats state
  const [stats, setStats] = useState<Stat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsSaving, setStatsSaving] = useState(false);
  const [statDialogOpen, setStatDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [statFormData, setStatFormData] = useState({
    label: "",
    label_fa: "",
    value: "",
    icon: "users",
    sort_order: 0,
  });

  // FAQ state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    question_fa: "",
    answer: "",
    answer_fa: "",
    sort_order: 0,
    active: true,
  });
  
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

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await settingsAPI.getStats();
      setStats(data);
    } catch (error) {
      toast({ title: "خطا در دریافت آمار", variant: "destructive" });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchFaqs = async () => {
    setFaqLoading(true);
    try {
      const data = await faqAPI.getAllAdmin();
      setFaqs(data.map((f: any) => ({ ...f, active: Boolean(f.active) })));
    } catch (error) {
      toast({ title: "خطا در دریافت سوالات", variant: "destructive" });
    } finally {
      setFaqLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchStats();
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.updateAll(settings);
      toast({ title: "تنظیمات با موفقیت ذخیره شد" });
    } catch (error) {
      toast({ title: "خطا در ذخیره تنظیمات", variant: "destructive" });
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطا",
        description: "رمز عبور جدید و تکرار آن مطابقت ندارند",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "خطا",
        description: "رمز عبور باید حداقل 4 کاراکتر باشد",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast({
        title: "موفق",
        description: "رمز عبور با موفقیت تغییر یافت",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در تغییر رمز عبور",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Stats handlers
  const resetStatForm = () => {
    setStatFormData({
      label: "",
      label_fa: "",
      value: "",
      icon: "users",
      sort_order: stats.length,
    });
    setEditingStat(null);
  };

  const handleOpenStatDialog = (stat?: Stat) => {
    if (stat) {
      setEditingStat(stat);
      setStatFormData({
        label: stat.label,
        label_fa: stat.label_fa,
        value: stat.value,
        icon: stat.icon,
        sort_order: stat.sort_order,
      });
    } else {
      resetStatForm();
    }
    setStatDialogOpen(true);
  };

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatsSaving(true);

    try {
      if (editingStat) {
        await settingsAPI.updateStat(editingStat.id, statFormData);
        toast({ title: "آمار با موفقیت ویرایش شد" });
      } else {
        await settingsAPI.createStat(statFormData);
        toast({ title: "آمار با موفقیت اضافه شد" });
      }
      setStatDialogOpen(false);
      resetStatForm();
      fetchStats();
    } catch (error) {
      toast({ title: "خطا در ذخیره آمار", variant: "destructive" });
    } finally {
      setStatsSaving(false);
    }
  };

  const handleDeleteStat = async (id: number) => {
    try {
      await settingsAPI.deleteStat(id);
      toast({ title: "آمار با موفقیت حذف شد" });
      fetchStats();
    } catch (error) {
      toast({ title: "خطا در حذف آمار", variant: "destructive" });
    }
  };

  // FAQ handlers
  const resetFaqForm = () => {
    setFaqFormData({
      question: "",
      question_fa: "",
      answer: "",
      answer_fa: "",
      sort_order: faqs.length,
      active: true,
    });
    setEditingFaq(null);
  };

  const handleOpenFaqDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqFormData({
        question: faq.question,
        question_fa: faq.question_fa,
        answer: faq.answer,
        answer_fa: faq.answer_fa,
        sort_order: faq.sort_order,
        active: faq.active,
      });
    } else {
      resetFaqForm();
    }
    setFaqDialogOpen(true);
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqSaving(true);

    try {
      if (editingFaq) {
        await faqAPI.update(editingFaq.id, faqFormData);
        toast({ title: "سوال با موفقیت ویرایش شد" });
      } else {
        await faqAPI.create(faqFormData);
        toast({ title: "سوال با موفقیت اضافه شد" });
      }
      setFaqDialogOpen(false);
      resetFaqForm();
      fetchFaqs();
    } catch (error) {
      toast({ title: "خطا در ذخیره سوال", variant: "destructive" });
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    try {
      await faqAPI.delete(id);
      toast({ title: "سوال با موفقیت حذف شد" });
      fetchFaqs();
    } catch (error) {
      toast({ title: "خطا در حذف سوال", variant: "destructive" });
    }
  };

  const handleToggleFaqActive = async (faq: FAQ) => {
    try {
      await faqAPI.update(faq.id, { ...faq, active: !faq.active });
      fetchFaqs();
    } catch (error) {
      toast({ title: "خطا در تغییر وضعیت", variant: "destructive" });
    }
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
        <CardTitle>تنظیمات</CardTitle>
        <CardDescription>تنظیمات عمومی سایت، آمار، سوالات متداول و رمز عبور</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              عمومی
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              لوگو
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              آمار
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              ویدیوها
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              سوالات متداول
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              رمز عبور
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={handleSubmit} className="space-y-6">
              {siteSettingsFields.map((field) => (
                <div key={field.key} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{field.label} (انگلیسی)</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={settings[field.key]?.value || ''}
                        onChange={(e) => updateSetting(field.key, 'value', e.target.value)}
                      />
                    ) : (
                      <Input
                        value={settings[field.key]?.value || ''}
                        onChange={(e) => updateSetting(field.key, 'value', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{field.label} (فارسی)</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={settings[field.key]?.value_fa || ''}
                        onChange={(e) => updateSetting(field.key, 'value_fa', e.target.value)}
                        dir="rtl"
                      />
                    ) : (
                      <Input
                        value={settings[field.key]?.value_fa || ''}
                        onChange={(e) => updateSetting(field.key, 'value_fa', e.target.value)}
                        dir="rtl"
                      />
                    )}
                  </div>
                </div>
              ))}

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                ذخیره تنظیمات
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="logo">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-4">لوگو وبسایت</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    لوگو در هدر سایت نمایش داده می‌شود. اندازه پیشنهادی: 48×48 پیکسل
                  </p>
                  <ImageUpload
                    label="تصویر لوگو"
                    value={settings.site_logo?.value || ''}
                    onChange={(url) => updateSetting('site_logo', 'value', url)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                ذخیره لوگو
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">مدیریت آمار</h3>
                <Dialog open={statDialogOpen} onOpenChange={setStatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenStatDialog()}>
                      <Plus className="w-4 h-4 ml-2" />
                      افزودن آمار
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingStat ? "ویرایش آمار" : "افزودن آمار جدید"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleStatSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>عنوان (انگلیسی)</Label>
                          <Input
                            value={statFormData.label}
                            onChange={(e) => setStatFormData({ ...statFormData, label: e.target.value })}
                            required
                            placeholder="Years Experience"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عنوان (فارسی)</Label>
                          <Input
                            value={statFormData.label_fa}
                            onChange={(e) => setStatFormData({ ...statFormData, label_fa: e.target.value })}
                            required
                            dir="rtl"
                            placeholder="سال تجربه"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>مقدار</Label>
                          <Input
                            value={statFormData.value}
                            onChange={(e) => setStatFormData({ ...statFormData, value: e.target.value })}
                            required
                            placeholder="10+"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>آیکون</Label>
                          <Select
                            value={statFormData.icon}
                            onValueChange={(value) => setStatFormData({ ...statFormData, icon: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map((opt) => {
                                const IconComp = opt.icon;
                                return (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                      <IconComp className="w-4 h-4" />
                                      {opt.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>ترتیب نمایش</Label>
                        <Input
                          type="number"
                          value={statFormData.sort_order}
                          onChange={(e) => setStatFormData({ ...statFormData, sort_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setStatDialogOpen(false)}>
                          انصراف
                        </Button>
                        <Button type="submit" disabled={statsSaving}>
                          {statsSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                          ذخیره
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : stats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  هیچ آماری ثبت نشده است
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.map((stat) => {
                    const iconOpt = iconOptions.find(i => i.value === stat.icon);
                    const IconComp = iconOpt?.icon || Users;
                    return (
                      <div key={stat.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComp className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-xl">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label_fa}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenStatDialog(stat)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف آمار</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا از حذف این آمار اطمینان دارید؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteStat(stat.id)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-4">ویدیو ۱</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <VideoUpload
                      label="فایل ویدیو"
                      value={settings.video_1?.value || ''}
                      onChange={(url) => updateSetting('video_1', 'value', url)}
                    />
                    <div className="space-y-4">
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
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-4">ویدیو ۲</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <VideoUpload
                      label="فایل ویدیو"
                      value={settings.video_2?.value || ''}
                      onChange={(url) => updateSetting('video_2', 'value', url)}
                    />
                    <div className="space-y-4">
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
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-4">ویدیو ۳</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <VideoUpload
                      label="فایل ویدیو"
                      value={settings.video_3?.value || ''}
                      onChange={(url) => updateSetting('video_3', 'value', url)}
                    />
                    <div className="space-y-4">
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
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                ذخیره ویدیوها
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="faq">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">مدیریت سوالات متداول</h3>
                <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenFaqDialog()}>
                      <Plus className="w-4 h-4 ml-2" />
                      افزودن سوال
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingFaq ? "ویرایش سوال" : "افزودن سوال جدید"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFaqSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>سوال (انگلیسی)</Label>
                          <Textarea
                            value={faqFormData.question}
                            onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                            required
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>سوال (فارسی)</Label>
                          <Textarea
                            value={faqFormData.question_fa}
                            onChange={(e) => setFaqFormData({ ...faqFormData, question_fa: e.target.value })}
                            required
                            dir="rtl"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>پاسخ (انگلیسی)</Label>
                          <Textarea
                            value={faqFormData.answer}
                            onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                            required
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>پاسخ (فارسی)</Label>
                          <Textarea
                            value={faqFormData.answer_fa}
                            onChange={(e) => setFaqFormData({ ...faqFormData, answer_fa: e.target.value })}
                            required
                            dir="rtl"
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>ترتیب نمایش</Label>
                          <Input
                            type="number"
                            value={faqFormData.sort_order}
                            onChange={(e) => setFaqFormData({ ...faqFormData, sort_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                          <Switch
                            checked={faqFormData.active}
                            onCheckedChange={(checked) => setFaqFormData({ ...faqFormData, active: checked })}
                          />
                          <Label>فعال</Label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setFaqDialogOpen(false)}>
                          انصراف
                        </Button>
                        <Button type="submit" disabled={faqSaving}>
                          {faqSaving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                          {editingFaq ? "ویرایش" : "افزودن"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {faqLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  هیچ سوالی یافت نشد
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        faq.active ? "bg-card" : "bg-muted/50 opacity-60"
                      }`}
                    >
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{faq.sort_order + 1}
                          </span>
                          {!faq.active && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">غیرفعال</span>
                          )}
                        </div>
                        <h4 className="font-medium mb-1" dir="rtl">{faq.question_fa}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2" dir="rtl">
                          {faq.answer_fa}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={faq.active}
                          onCheckedChange={() => handleToggleFaqActive(faq)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenFaqDialog(faq)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف سوال</AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا از حذف این سوال اطمینان دارید؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFaq(faq.id)}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Lock className="w-4 h-4 ml-2" />
                )}
                تغییر رمز عبور
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;