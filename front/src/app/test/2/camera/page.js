"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Camera2() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // IndexedDB 초기화
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("skinDiagnosis", 1);

      request.onerror = () => {
        reject(new Error("IndexedDB 열기 실패"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("photos")) {
          db.createObjectStore("photos");
        }
      };
    });
  };

  // IndexedDB에 사진 저장
  const savePhotoToDB = async (blob) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["photos"], "readwrite");
      const store = transaction.objectStore("photos");
      
      return new Promise((resolve, reject) => {
        const request = store.put(blob, "facePhoto");
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error("사진 저장 실패"));
        };
      });
    } catch (err) {
      throw err;
    }
  };

  // 카메라 접근
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("카메라 접근 실패:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.");
        } else {
          setError("카메라에 접근할 수 없습니다. 다시 시도해주세요.");
        }
      }
    };

    startCamera();

    // 정리 함수
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 사진 촬영 및 저장
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);
    setIsLoading(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // 비디오 크기에 맞춰 캔버스 크기 설정
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 비디오 프레임을 캔버스에 그리기
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Blob으로 변환
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            throw new Error("이미지 변환 실패");
          }
          
          // IndexedDB에 저장
          await savePhotoToDB(blob);
          
          // 저장 완료 후 questions 페이지로 이동
          setTimeout(() => {
            router.push("/test/2/questions");
          }, 500);
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error("촬영 실패:", err);
      setError(err.message || "사진 촬영에 실패했습니다. 다시 시도해주세요.");
      setIsLoading(false);
      setIsCapturing(false);
    }
  };

  if (error && !isLoading) {
    return (
      <div className="col-span-2 flex flex-col justify-center items-center gap-12 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-16 shadow-2xl border-2 border-orange-200 max-w-4xl">
          <div className="flex flex-col items-center gap-8">
            <span className="text-8xl">⚠️</span>
            <h2 className="text-6xl font-bold text-orange-900 text-center">
              오류가 발생했습니다
            </h2>
            <p className="text-4xl text-orange-700 text-center leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 px-16 py-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-4xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 active:scale-95"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="col-span-2 flex flex-col justify-center items-center gap-20 z-10">
        <div className="relative">
          <div className="w-80 h-80 border-[20px] border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 비디오 및 가이드라인 */}
      <div className="col-span-2 flex flex-col justify-center items-center gap-12 z-10">
        {/* 카메라 화면 */}
        <div className="relative w-full max-w-[80%] aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
          
          {/* 가이드라인 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[40%] aspect-square rounded-full border-8 border-white/80 shadow-2xl"></div>
          </div>
        </div>

        {/* 촬영 안내 메시지
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-orange-200 max-w-4xl">
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-6xl font-bold text-orange-900 text-center">
              얼굴을 가이드라인 안에 맞춰주세요
            </h2>
            <p className="text-4xl text-orange-700 text-center leading-relaxed">
              준비되면 아래 버튼을 눌러주세요 📸
            </p>
          </div>
        </div> */}

        {/* 다음으로 버튼 */}
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="px-32 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-2xl font-bold rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>다음으로</span>
          <span className="text-3xl">→</span>
        </button>
      </div>

      {/* 숨겨진 캔버스 (촬영용) */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}

