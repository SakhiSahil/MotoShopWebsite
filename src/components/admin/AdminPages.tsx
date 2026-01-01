import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { pagesAPI } from "@/lib/api";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

interface Page {
  id: string;
  title: string;
  title_fa: string;
  content: string;
  content_fa: string;
  meta_description?: string;
  meta_description_fa?: string;
}

const AdminPages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({ id: "", title: "", title_fa: "" });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const data = await pagesAPI.getAll();
      setPages(data);
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].id);
      }
    } catch (error) {
      toast({ title: "خطا در دریافت صفحات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSave = async (page: Page) => {
    setSaving(page.id);

    try {
      await pagesAPI.update(page.id, page);
      toast({ title: "صفحه با موفقیت ذخیره شد" });
    } catch (error) {
      toast({ title: "خطا در ذخیره صفحه", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    if (!newPage.id || !newPage.title || !newPage.title_fa) {
      toast({ title: "لطفا تمام فیلدها را پر کنید", variant: "destructive" });
      return;
    }

    // Validate ID format (only letters, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(newPage.id)) {
      toast({ title: "شناسه باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      await pagesAPI.create({
        id: newPage.id,
        title: newPage.title,
        title_fa: newPage.title_fa,
        content: "",
        content_fa: "",
      });
      toast({ title: "صفحه با موفقیت ایجاد شد" });
      setNewPage({ id: "", title: "", title_fa: "" });
      setDialogOpen(false);
      await fetchPages();
      setActiveTab(newPage.id);
    } catch (error) {
      toast({ 
        title: "خطا در ایجاد صفحه", 
        description: error instanceof Error ? error.message : "خطای ناشناخته",
        variant: "destructive" 
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await pagesAPI.delete(id);
      toast({ title: "صفحه با موفقیت حذف شد" });
      const remaining = pages.filter(p => p.id !== id);
      setPages(remaining);
      if (activeTab === id && remaining.length > 0) {
        setActiveTab(remaining[0].id);
      }
    } catch (error) {
      toast({ title: "خطا در حذف صفحه", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const updatePage = (id: string, field: keyof Page, value: string) => {
    setPages(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
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
        <CardTitle>مدیریت محتوای صفحات</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              صفحه جدید
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>ایجاد صفحه جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>شناسه صفحه (انگلیسی)</Label>
                <Input
                  value={newPage.id}
                  onChange={(e) => setNewPage({ ...newPage, id: e.target.value.toLowerCase() })}
                  placeholder="privacy-policy"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  فقط حروف کوچک انگلیسی، اعداد و خط تیره مجاز است
                </p>
              </div>
              <div className="space-y-2">
                <Label>عنوان (انگلیسی)</Label>
                <Input
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="Privacy Policy"
                />
              </div>
              <div className="space-y-2">
                <Label>عنوان (فارسی)</Label>
                <Input
                  value={newPage.title_fa}
                  onChange={(e) => setNewPage({ ...newPage, title_fa: e.target.value })}
                  placeholder="حریم خصوصی"
                  dir="rtl"
                />
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                ایجاد صفحه
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {pages.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="mb-4 flex-wrap h-auto">
              {pages.map((page) => (
                <TabsTrigger key={page.id} value={page.id}>
                  {page.title_fa}
                </TabsTrigger>
              ))}
            </TabsList>

            {pages.map((page) => (
              <TabsContent key={page.id} value={page.id} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>عنوان (انگلیسی)</Label>
                    <Input
                      value={page.title}
                      onChange={(e) => updatePage(page.id, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>عنوان (فارسی)</Label>
                    <Input
                      value={page.title_fa}
                      onChange={(e) => updatePage(page.id, 'title_fa', e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>محتوا (انگلیسی)</Label>
                    <Textarea
                      value={page.content}
                      onChange={(e) => updatePage(page.id, 'content', e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>محتوا (فارسی)</Label>
                    <Textarea
                      value={page.content_fa}
                      onChange={(e) => updatePage(page.id, 'content_fa', e.target.value)}
                      rows={6}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>توضیحات متا (انگلیسی)</Label>
                    <Textarea
                      value={page.meta_description || ''}
                      onChange={(e) => updatePage(page.id, 'meta_description', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>توضیحات متا (فارسی)</Label>
                    <Textarea
                      value={page.meta_description_fa || ''}
                      onChange={(e) => updatePage(page.id, 'meta_description_fa', e.target.value)}
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button onClick={() => handleSave(page)} disabled={saving === page.id}>
                    {saving === page.id ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    ذخیره تغییرات
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deleting === page.id}>
                        {deleting === page.id ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 ml-2" />
                        )}
                        حذف صفحه
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          این عمل قابل بازگشت نیست. صفحه "{page.title_fa}" به طور دائمی حذف خواهد شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse gap-2">
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(page.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">هیچ صفحه‌ای یافت نشد</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              ایجاد اولین صفحه
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPages;