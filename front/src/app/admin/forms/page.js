"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/apiConfig";

export default function AdminFormsPage() {
  const [forms, setForms] = useState([]);
  const [payload, setPayload] = useState({
    event_id: "",
    title: "",
    description: "",
    fields: "{}",
    active: true,
    expires_at: "",
    share_url: ""
  });
  const [createdId, setCreatedId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState("");

  const fetchForms = async () => {
    const res = await fetch(`${API_BASE}/api/forms`);
    const data = await res.json();
    setForms(data);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setEditId("");
    setPayload({ event_id: "", title: "", description: "", fields: "{}", active: true, expires_at: "", share_url: "" });
    setCreatedId("");
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = {
        event_id: payload.event_id || null,
        title: payload.title,
        description: payload.description || null,
        fields: JSON.parse(payload.fields),
        active: !!payload.active,
        expires_at: payload.expires_at || null,
        share_url: payload.share_url || null,
      };

      let res;
      if (editId) {
        res = await fetch(`${API_BASE}/api/forms/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${API_BASE}/api/forms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCreatedId(data.id);
      await fetchForms();
      if (!editId) setPayload((p) => ({ ...p, title: "", description: "", fields: "{}" }));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/forms/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEditId(data.id);
      setPayload({
        event_id: data.event_id || "",
        title: data.title || "",
        description: data.description || "",
        fields: JSON.stringify(data.fields ?? {}, null, 2),
        active: !!data.active,
        expires_at: data.expires_at || "",
        share_url: data.share_url || "",
      });
      setCreatedId("");
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin · Forms</h1>

      <form onSubmit={onSubmit} className="grid gap-3 max-w-3xl mb-10">
        {editId && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span>수정 중: {editId}</span>
            <button type="button" onClick={resetForm} className="px-3 py-1 border rounded">새로 만들기</button>
          </div>
        )}
        <input name="title" value={payload.title} onChange={onChange} placeholder="제목" className="border p-2 rounded" />
        <input name="description" value={payload.description} onChange={onChange} placeholder="설명" className="border p-2 rounded" />
        <input name="share_url" value={payload.share_url} onChange={onChange} placeholder="공유 URL(옵션)" className="border p-2 rounded" />
        <textarea name="fields" value={payload.fields} onChange={onChange} placeholder="fields(JSON) - FORM_DATA.md 형식" rows={14} className="border p-2 rounded font-mono" />
        <label className="flex items-center gap-2"><input type="checkbox" name="active" checked={payload.active} onChange={onChange} /> 활성</label>
        <input name="expires_at" value={payload.expires_at} onChange={onChange} placeholder="만료(옵션, ISO)" className="border p-2 rounded" />
        <div className="flex gap-2">
          <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? (editId ? "저장 중..." : "생성 중...") : (editId ? "수정 저장" : "폼 생성")}</button>
          {editId && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">취소</button>}
        </div>
        {createdId && <p className="text-green-700">{editId ? "저장됨" : "생성됨"}: {createdId}</p>}
        {error && <p className="text-red-700">오류: {error}</p>}
      </form>

      <h2 className="text-2xl font-semibold mb-3">폼 목록</h2>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">id</th>
              <th className="p-2 text-left">title</th>
              <th className="p-2 text-left">share_url</th>
              <th className="p-2 text-left">action</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-2">{f.id}</td>
                <td className="p-2">{f.title}</td>
                <td className="p-2">{f.share_url || "-"}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleLoad(f.id)} className="text-blue-600 underline">불러오기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
