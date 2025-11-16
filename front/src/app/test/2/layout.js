import Link from "next/link";

export default function Test2Layout({ children }) {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="w-full max-w-[2560px] min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50 grid grid-cols-2 gap-32 px-32 py-20 relative overflow-hidden">
        {/* 홈 버튼 */}
        <Link
          href="/list"
          className="absolute top-12 left-12 px-8 py-4 text-2xl text-orange-700 hover:text-orange-900 transition-colors bg-white/50 rounded-full backdrop-blur-sm z-50"
        >
          ← 목록으로
        </Link>

        {/* 배경 장식 */}
        <div className="absolute top-40 right-40 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-40 w-[600px] h-[600px] bg-yellow-200/30 rounded-full blur-3xl"></div>

        {/* 페이지 콘텐츠 */}
        {children}
      </div>
    </div>
  );
}

