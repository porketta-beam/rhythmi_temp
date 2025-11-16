"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    host_id: "00000000-0000-0000-0000-000000000000",
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    capacity: "",
    status: "draft"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [editId, setEditId] = useState("");

  const { user, loading: authLoading } = useAuth();

  const fetchEvents = async () => {
    const res = await fetch(`${API_BASE}/api/events`);
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setForm((prev) => ({ ...prev, host_id: user.id }));
    }
  }, [user?.id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditId("");
    setForm((prev) => ({ ...prev, title: "", description: "", location: "", start_time: "", end_time: "", capacity: "", status: "draft" }));
    setError("");
    setCreatedId("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCreatedId("");
    try {
      if (!user?.id) throw new Error("로그인이 필요합니다.");
      const payload = {
        ...form,
        host_id: user.id,
        capacity: form.capacity ? Number(form.capacity) : null
      };
      const url = editId ? `${API_BASE}/api/events/${editId}` : `${API_BASE}/api/events`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCreatedId(data.id);
      await fetchEvents();
      if (!editId) resetForm();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ev = await res.json();
      setEditId(ev.id);
      setForm({
        host_id: ev.host_id,
        title: ev.title || "",
        description: ev.description || "",
        location: ev.location || "",
        start_time: ev.start_time || "",
        end_time: ev.end_time || "",
        capacity: ev.capacity ?? "",
        status: ev.status || "draft",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin · Events</h1>

      <form onSubmit={onSubmit} className="grid gap-3 max-w-2xl mb-10">
        {editId && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span>수정 중: {editId}</span>
            <button type="button" onClick={resetForm} className="px-3 py-1 border rounded">새로 만들기</button>
          </div>
        )}
        <p className="text-sm text-gray-600">Host: {user?.email ?? "(로그인 필요)"}</p>
        <input name="title" value={form.title} onChange={onChange} placeholder="제목" className="border p-2 rounded" required />
        <textarea name="description" value={form.description} onChange={onChange} placeholder="설명" className="border p-2 rounded" />
        <input name="location" value={form.location} onChange={onChange} placeholder="장소" className="border p-2 rounded" />
        <label className="text-sm">시작/종료 시간(ISO)</label>
        <input name="start_time" value={form.start_time} onChange={onChange} placeholder="2025-11-16T10:00:00" className="border p-2 rounded" required />
        <input name="end_time" value={form.end_time} onChange={onChange} placeholder="2025-11-16T12:00:00" className="border p-2 rounded" required />
        <input name="capacity" value={form.capacity} onChange={onChange} placeholder="정원(선택)" className="border p-2 rounded" />
        <select name="status" value={form.status} onChange={onChange} className="border p-2 rounded">
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="active">active</option>
          <option value="completed">completed</option>
        </select>
        <div className="flex gap-2">
          <button disabled={loading || authLoading || !user?.id} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? (editId ? "저장 중..." : "생성 중...") : (editId ? "수정 저장" : "이벤트 생성")}</button>
          {editId && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">취소</button>}
        </div>
        {createdId && <p className="text-green-700">{editId ? "저장됨" : "생성됨"}: {createdId}</p>}
        {error && <p className="text-red-700">오류: {error}</p>}
      </form>

      <h2 className="text-2xl font-semibold mb-3">이벤트 목록</h2>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">id</th>
              <th className="p-2 text-left">title</th>
              <th className="p-2 text-left">start_time</th>
              <th className="p-2 text-left">status</th>
              <th className="p-2 text-left">action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="border-t">
                <td className="p-2">{ev.id}</td>
                <td className="p-2">{ev.title}</td>
                <td className="p-2">{ev.start_time}</td>
                <td className="p-2">{ev.status}</td>
                <td className="p-2"><button className="text-blue-600 underline" onClick={() => handleLoad(ev.id)}>불러오기</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
