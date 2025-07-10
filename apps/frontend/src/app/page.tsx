import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>أهلاً بك في Internal Linking Analyzer Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>هذه هي لوحة التحكم الرئيسية. استخدم الشريط الجانبي للتنقل بين الأدوات المتاحة.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
