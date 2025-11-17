import Link from "next/link";

export default function Test2Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6B996]/50 via-[#EB8C80]/50 to-[#F6B996]/50 flex items-center justify-center">
      <div className="w-full max-w-[2560px] min-h-screen grid grid-cols-2 gap-32 px-32 py-20 relative overflow-hidden">

        {/* 배경 장식 */}
        <div className="absolute top-40 right-40 w-[600px] h-[600px] bg-[#FF5500]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-40 w-[600px] h-[600px] bg-[#FF5500]/20 rounded-full blur-3xl"></div>

        {/* 페이지 콘텐츠 */}
        {children}
      </div>
    </div>
  );
}

