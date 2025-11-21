import Image from "next/image";

export default function Test2Layout({ children }) {
  return (
    <div className="h-screen bg-gradient-to-r from-[hsl(22,100%,89%)] to-[hsl(22,86%,78%)] flex items-center justify-center relative overflow-hidden">

      {/* 중앙 원형 프레임 (배경 장식) */}
      <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[84vw] h-[84vw] max-w-[1080px] max-h-[1080px] rounded-full border-[3px] border-white/40 z-5"></div>

      {/* 상단 로고 (가로 중앙) */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[160px] h-[121px] z-10">
        <Image
          src="/rhythmi_logo_2_white.svg"
          alt="Rhythmi Logo"
          width={160}
          height={121}
          className="w-full h-full object-contain"
        />
      </div>

      {/* 하단 작은 로고 (가로 중앙) */}
      <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[80px] h-[80px] z-10">
        <Image
          src="/rhythmi_logo_1_white.svg"
          alt="Rhythmi Icon"
          width={80}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>

      {/* 페이지 콘텐츠 (기존 2열 그리드 구조 유지) */}
      <div className="w-full h-full grid grid-cols-2 gap-8 px-8 pt-[240px] pb-[160px] relative z-20 overflow-hidden max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}

