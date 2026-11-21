import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة 404",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="relative w-36 h-12 mx-auto">
          <Image
            src="/images/logo.png"
            alt="إديو هب غزة | EduHub Gaza"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-6xl font-black text-emerald-600 font-mono">404</div>
        <h1 className="text-2xl font-black text-slate-900">الصفحة غير موجودة</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها في مساحة إديو هب غزة (EduHub) غير متوفرة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
