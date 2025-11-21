import Link from "next/link";

export default function Design2() {
  return (
    <div className="col-span-2 flex flex-col items-center justify-center gap-12 z-10">
      {/* 메인 헤드라인 */}
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold text-white tracking-wide leading-tight">
          For You, In Every Rhythm of the Day
        </h1>
        <p className="text-xl text-gray-800 font-normal">
          하루 속 숨겨진 내 피부의 리듬은?
        </p>
      </div>

      {/* 시작하기 버튼 */}
      <Link
        href="/test/2/consent"
        className="px-24 py-4 bg-[#FFB88C]/50 hover:bg-[#FFB88C]/60 text-white text-2xl font-bold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
      >
        시작하기
      </Link>

      {/* 소요시간 */}
      <p className="text-gray-800 text-lg font-normal">
        소요시간 | 3분
      </p>
    </div>
  );
}
