export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          أهلاً بك في Internal Linking Analyzer Pro
        </h1>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">لوحة التحكم الرئيسية</h2>
          <p className="text-gray-600 mb-4">
            هذه هي لوحة التحكم الرئيسية. استخدم الروابط أدناه للتنقل بين الأدوات المتاحة.
          </p>
          
          <div className="space-y-2">
            <a 
              href="/tools/keyword-extractor" 
              className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              🔍 أداة استخراج الكلمات المفتاحية
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
