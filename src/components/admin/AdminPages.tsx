import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { pagesAPI } from "@/lib/api";
import { Loader2, Save } from "lucide-react";

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
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const data = await pagesAPI.getAll();
      setPages(data);
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
      <CardHeader>
        <CardTitle>مدیریت محتوای صفحات</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={pages[0]?.id} dir="rtl">
          <TabsList className="mb-4">
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

              <Button onClick={() => handleSave(page)} disabled={saving === page.id}>
                {saving === page.id ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                ذخیره تغییرات
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        {pages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            هیچ صفحه‌ای یافت نشد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPages;
