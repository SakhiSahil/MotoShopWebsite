import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authAPI, setAuthToken, getAuthToken, checkAPIHealth } from "@/lib/api";
import { LogOut, Settings, Package, Image, FileText, Users, LayoutDashboard, AlertCircle, Tags, MapPin, Info, MessageSquare } from "lucide-react";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminSlides from "@/components/admin/AdminSlides";
import AdminBrands from "@/components/admin/AdminBrands";
import AdminPages from "@/components/admin/AdminPages";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminDealers from "@/components/admin/AdminDealers";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminContact from "@/components/admin/AdminContact";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isHealthy = await checkAPIHealth();
      setApiAvailable(isHealthy);

      if (!isHealthy) {
        setIsLoading(false);
        return;
      }

      const token = getAuthToken();
      if (token) {
        try {
          await authAPI.verify();
          setIsAuthenticated(true);
        } catch {
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const response = await authAPI.login(username, password);
      setAuthToken(response.token);
      setIsAuthenticated(true);
      toast({
        title: "ورود موفق",
        description: "به پنل مدیریت خوش آمدید",
      });
    } catch (error) {
      toast({
        title: "خطا در ورود",
        description: error instanceof Error ? error.message : "نام کاربری یا رمز عبور اشتباه است",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    toast({
      title: "خروج موفق",
      description: "با موفقیت از سیستم خارج شدید",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!apiAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Helmet>
          <title>Admin Panel - API Unavailable</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <CardTitle>سرور در دسترس نیست</CardTitle>
            <CardDescription>
              لطفا اطمینان حاصل کنید که سرور بک‌اند در حال اجرا است
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm font-mono text-muted-foreground">
              <p className="mb-2">برای اجرای سرور:</p>
              <p>cd backend</p>
              <p>npm install</p>
              <p>npm run init-db</p>
              <p>npm run dev</p>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              تلاش مجدد
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              بازگشت به سایت
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Helmet>
          <title>ورود به پنل مدیریت</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">پنل مدیریت</CardTitle>
            <CardDescription>
              برای دسترسی به پنل مدیریت وارد شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>پنل مدیریت - فولاد سکلیت</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">پنل مدیریت</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              مشاهده سایت
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" dir="rtl">
          <TabsList className="grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">محصولات</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              <span className="hidden sm:inline">دسته‌بندی</span>
            </TabsTrigger>
            <TabsTrigger value="slides" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">اسلایدر</span>
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">برندها</span>
            </TabsTrigger>
            <TabsTrigger value="dealers" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">نمایندگی‌ها</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">درباره ما</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">تماس</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">صفحات</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">تنظیمات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>
          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>
          <TabsContent value="slides">
            <AdminSlides />
          </TabsContent>
          <TabsContent value="brands">
            <AdminBrands />
          </TabsContent>
          <TabsContent value="dealers">
            <AdminDealers />
          </TabsContent>
          <TabsContent value="about">
            <AdminAbout />
          </TabsContent>
          <TabsContent value="contact">
            <AdminContact />
          </TabsContent>
          <TabsContent value="pages">
            <AdminPages />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
