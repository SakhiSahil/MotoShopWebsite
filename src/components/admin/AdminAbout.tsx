import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Edit, Trash2 } from "lucide-react";
import ImageUpload from "./ImageUpload";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface AboutContent {
  id: string;
  title: string;
  title_fa: string;
  content: string;
  content_fa: string;
  image?: string;
  years_experience?: string;
}

interface Value {
  id: number;
  title: string;
  title_fa: string;
  description: string;
  description_fa: string;
  icon: string;
  sort_order: number;
}

interface TeamMember {
  id: number;
  name: string;
  name_fa: string;
  role: string;
  role_fa: string;
  image: string;
  sort_order: number;
}

const iconOptions = [
  { value: 'shield', label: 'Shield (کیفیت)' },
  { value: 'heart', label: 'Heart (اعتماد)' },
  { value: 'wrench', label: 'Wrench (خدمات)' },
  { value: 'award', label: 'Award (جایزه)' },
  { value: 'users', label: 'Users (کاربران)' },
  { value: 'target', label: 'Target (هدف)' },
  { value: 'star', label: 'Star (ستاره)' },
  { value: 'check', label: 'Check (تأیید)' },
];

const AdminAbout = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingValue, setEditingValue] = useState<Value | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const { toast } = useToast();

  const getToken = () => localStorage.getItem('admin_token');

  const fetchData = async () => {
    try {
      const [contentRes, valuesRes, teamRes] = await Promise.all([
        fetch(`${API_BASE_URL}/about/content`),
        fetch(`${API_BASE_URL}/about/values`),
        fetch(`${API_BASE_URL}/about/team`),
      ]);

      if (contentRes.ok) {
        const content = await contentRes.json();
        setAboutContent(content);
      }
      if (valuesRes.ok) {
        const valuesData = await valuesRes.json();
        setValues(valuesData);
      }
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData);
      }
    } catch (error) {
      toast({ title: "خطا در دریافت اطلاعات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // About Content handlers
  const handleSaveContent = async () => {
    if (!aboutContent) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/about/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(aboutContent),
      });
      if (res.ok) {
        toast({ title: "محتوا با موفقیت ذخیره شد" });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "خطا در ذخیره محتوا", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Values handlers
  const handleSaveValue = async () => {
    if (!editingValue) return;
    setSaving(true);
    try {
      const isNew = !editingValue.id;
      const res = await fetch(
        `${API_BASE_URL}/about/values${isNew ? '' : `/${editingValue.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify(editingValue),
        }
      );
      if (res.ok) {
        toast({ title: isNew ? "ارزش جدید اضافه شد" : "ارزش بروزرسانی شد" });
        setValueDialogOpen(false);
        setEditingValue(null);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "خطا در ذخیره ارزش", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteValue = async (id: number) => {
    if (!confirm("آیا از حذف این ارزش مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/about/values/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast({ title: "ارزش حذف شد" });
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "خطا در حذف ارزش", variant: "destructive" });
    }
  };

  // Team handlers
  const handleSaveMember = async () => {
    if (!editingMember) return;
    setSaving(true);
    try {
      const isNew = !editingMember.id;
      const res = await fetch(
        `${API_BASE_URL}/about/team${isNew ? '' : `/${editingMember.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify(editingMember),
        }
      );
      if (res.ok) {
        toast({ title: isNew ? "عضو جدید اضافه شد" : "عضو بروزرسانی شد" });
        setMemberDialogOpen(false);
        setEditingMember(null);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "خطا در ذخیره عضو", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("آیا از حذف این عضو مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/about/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast({ title: "عضو حذف شد" });
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "خطا در حذف عضو", variant: "destructive" });
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
        <CardTitle>مدیریت صفحه درباره ما</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="content">محتوای اصلی</TabsTrigger>
            <TabsTrigger value="values">ارزش‌ها</TabsTrigger>
            <TabsTrigger value="team">تیم</TabsTrigger>
          </TabsList>

          {/* Main Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {aboutContent && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>عنوان داستان (انگلیسی)</Label>
                    <Input
                      value={aboutContent.title}
                      onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>عنوان داستان (فارسی)</Label>
                    <Input
                      value={aboutContent.title_fa}
                      onChange={(e) => setAboutContent({ ...aboutContent, title_fa: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>متن داستان (انگلیسی)</Label>
                    <Textarea
                      value={aboutContent.content}
                      onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>متن داستان (فارسی)</Label>
                    <Textarea
                      value={aboutContent.content_fa}
                      onChange={(e) => setAboutContent({ ...aboutContent, content_fa: e.target.value })}
                      rows={6}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>سال‌های تجربه</Label>
                    <Input
                      value={aboutContent.years_experience || '20+'}
                      onChange={(e) => setAboutContent({ ...aboutContent, years_experience: e.target.value })}
                      placeholder="20+"
                    />
                  </div>
                <div className="space-y-2">
                  <Label>تصویر</Label>
                  <ImageUpload
                    label="تصویر داستان"
                    value={aboutContent.image || ''}
                    onChange={(url) => setAboutContent({ ...aboutContent, image: url })}
                  />
                </div>
                </div>

                <Button onClick={handleSaveContent} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                  ذخیره تغییرات
                </Button>
              </>
            )}
          </TabsContent>

          {/* Values Tab */}
          <TabsContent value="values" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={valueDialogOpen} onOpenChange={setValueDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() =>
                      setEditingValue({
                        id: 0,
                        title: '',
                        title_fa: '',
                        description: '',
                        description_fa: '',
                        icon: 'shield',
                        sort_order: values.length,
                      })
                    }
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن ارزش
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>{editingValue?.id ? 'ویرایش ارزش' : 'افزودن ارزش جدید'}</DialogTitle>
                  </DialogHeader>
                  {editingValue && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>عنوان (انگلیسی)</Label>
                          <Input
                            value={editingValue.title}
                            onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عنوان (فارسی)</Label>
                          <Input
                            value={editingValue.title_fa}
                            onChange={(e) => setEditingValue({ ...editingValue, title_fa: e.target.value })}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>توضیحات (انگلیسی)</Label>
                          <Textarea
                            value={editingValue.description}
                            onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>توضیحات (فارسی)</Label>
                          <Textarea
                            value={editingValue.description_fa}
                            onChange={(e) => setEditingValue({ ...editingValue, description_fa: e.target.value })}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>آیکون</Label>
                        <select
                          className="w-full p-2 border rounded-md bg-background"
                          value={editingValue.icon}
                          onChange={(e) => setEditingValue({ ...editingValue, icon: e.target.value })}
                        >
                          {iconOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button onClick={handleSaveValue} disabled={saving} className="w-full">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                        ذخیره
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">عنوان</TableHead>
                  <TableHead className="text-right">آیکون</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {values.map((value) => (
                  <TableRow key={value.id}>
                    <TableCell>{value.title_fa}</TableCell>
                    <TableCell>{value.icon}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingValue(value);
                            setValueDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteValue(value.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() =>
                      setEditingMember({
                        id: 0,
                        name: '',
                        name_fa: '',
                        role: '',
                        role_fa: '',
                        image: '',
                        sort_order: teamMembers.length,
                      })
                    }
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن عضو
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>{editingMember?.id ? 'ویرایش عضو' : 'افزودن عضو جدید'}</DialogTitle>
                  </DialogHeader>
                  {editingMember && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>نام (انگلیسی)</Label>
                          <Input
                            value={editingMember.name}
                            onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>نام (فارسی)</Label>
                          <Input
                            value={editingMember.name_fa}
                            onChange={(e) => setEditingMember({ ...editingMember, name_fa: e.target.value })}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>نقش (انگلیسی)</Label>
                          <Input
                            value={editingMember.role}
                            onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>نقش (فارسی)</Label>
                          <Input
                            value={editingMember.role_fa}
                            onChange={(e) => setEditingMember({ ...editingMember, role_fa: e.target.value })}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>تصویر</Label>
                        <ImageUpload
                          label="تصویر عضو"
                          value={editingMember.image}
                          onChange={(url) => setEditingMember({ ...editingMember, image: url })}
                        />
                      </div>
                      <Button onClick={handleSaveMember} disabled={saving} className="w-full">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                        ذخیره
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تصویر</TableHead>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">نقش</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell>{member.name_fa}</TableCell>
                    <TableCell>{member.role_fa}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMember(member);
                            setMemberDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminAbout;
