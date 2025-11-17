import Link from "next/link";

export default function List() {
  const designs = [
    { id: 1, name: "시안 1", description: "모던하고 심플한 디자인", path: "/test/1" },
    { id: 2, name: "시안 2", description: "밝고 친근한 디자인", path: "/test/2" },
    { id: 3, name: "시안 3", description: "프리미엄 고급스러운 디자인", path: "/test/3" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 md:mb-10 lg:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">시안 선택</h1>
          <Link
            href="/"
            className="px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base"
          >
            홈으로
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {designs.map((design) => (
            <Link
              key={design.id}
              href={design.path}
              className="group flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6 p-8 md:p-10 lg:p-12 bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-400 active:scale-95 min-h-[250px] md:min-h-[280px] lg:min-h-[300px]"
            >
              <div className="w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl md:text-3xl lg:text-4xl font-bold group-hover:scale-110 transition-transform">
                {design.id}
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2 text-center">
                <h2 className="text-xl md:text-xl lg:text-2xl font-bold text-gray-900">
                  {design.name}
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  {design.description}
                </p>
              </div>
              <span className="mt-2 md:mt-3 lg:mt-4 px-5 md:px-5.5 lg:px-6 py-1.5 md:py-1.5 lg:py-2 bg-blue-600 text-white rounded-full group-hover:bg-blue-700 transition-colors text-sm md:text-base">
                선택하기
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 md:mt-12 lg:mt-16 p-4 md:p-5 lg:p-6 bg-blue-50 rounded-xl">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1.5 md:mb-2">
            시안 안내
          </h3>
          <p className="text-sm md:text-base text-gray-600">
            각 시안을 클릭하여 피부 진단 프로토타입을 체험해보세요.
            키오스크 환경(1080x1920 세로형)에 최적화된 디자인입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
