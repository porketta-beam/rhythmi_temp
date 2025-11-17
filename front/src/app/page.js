"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <main className="flex flex-col items-center justify-center gap-8 md:gap-10 lg:gap-12 text-center max-w-2xl">
        <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">LeadMe</h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600">10분 안에 나만의 피부 루틴을 찾아보세요</p>
        </div>

        <Link
          href="/list"
          className="px-8 md:px-10 lg:px-12 py-4 md:py-5 lg:py-6 bg-blue-600 text-white text-xl md:text-2xl lg:text-3xl font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 min-w-[180px] md:min-w-[200px] min-h-[60px] md:min-h-[72px] flex items-center justify-center"
        >
          시안 선택하기
        </Link>

        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded bg-gray-800 text-white">로그인</Link>
          {user && (
            <>
              <Link href="/admin/events" className="px-4 py-2 rounded bg-blue-600 text-white">이벤트 생성</Link>
              <Link href="/admin/forms" className="px-4 py-2 rounded bg-green-600 text-white">설문 생성</Link>
            </>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-8">키오스크 피부 진단 프로토타입</p>
      </main>
    </div>
  );
}
