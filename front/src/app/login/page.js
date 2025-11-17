"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/admin/events" : undefined } });
      if (error) throw error;
      setMessage("로그인 링크를 이메일로 보냈습니다.");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">로그인</h1>
        {user ? (
          <div className="space-y-3">
            <p>로그인됨: {user.email}</p>
            <div className="flex gap-2">
              <button onClick={() => router.push("/admin/events")} className="bg-blue-600 text-white px-4 py-2 rounded">이벤트 생성</button>
              <button onClick={() => router.push("/admin/forms")} className="bg-green-600 text-white px-4 py-2 rounded">설문 생성</button>
              <button onClick={signOut} className="bg-gray-200 px-4 py-2 rounded">로그아웃</button>
            </div>
          </div>
        ) : (
          <form onSubmit={signIn} className="grid gap-3">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="이메일" className="border p-2 rounded" required />
            <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading?"전송 중...":"매직 링크 보내기"}</button>
            {message && <p className="text-green-700">{message}</p>}
            {error && <p className="text-red-700">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
