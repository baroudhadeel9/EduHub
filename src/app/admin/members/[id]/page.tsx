import { Suspense } from "react";
import MemberProfileView from "@/components/admin/members/MemberProfileView";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

async function MemberProfileContent({ params }: MemberDetailPageProps) {
  const { id } = await params;
  return <MemberProfileView memberId={id} />;
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-sm font-bold text-slate-500">جاري التحميل...</div>}>
      <MemberProfileContent params={params} />
    </Suspense>
  );
}


