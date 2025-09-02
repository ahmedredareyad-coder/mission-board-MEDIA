import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, RefreshCcw, Search, Trash2, Upload } from "lucide-react";

const LS_KEY = "hcww_missions_v1";
const initialCompanies = ["القابضة","القاهرة","الجيزة","الإسكندرية","الغربية","الشرقية","أسوان"];
const initialOwners = ["أحمد رضا رياض","محمد صلاح","د. صلاح بيومي","م. ممدوح رسلان","فريق الإعلام"];
const statusOptions = [
  { value: "not_started", label: "لم يبدأ" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "on_hold", label: "تجميد المهمة" },
  { value: "done", label: "تم الانتهاء" }
];
const priorityScale=[1,2,3]; const importanceScale=[1,2,3];

function toCSV(rows){
  if(!rows?.length) return "";
  const headers=["ID","الشركة","المسئول","المهمة","درجة الأهمية","الأولوية","تاريخ طلب المهمة","تاريخ افتراضي للانتهاء","تاريخ الانتهاء الفعلي","حالة المتابعة","ملاحظات"];
  const escape=(v)=>`\"${String(v??"").replaceAll('\"','\"\"')}\"`;
  return [headers.join(",")].concat(rows.map(r=>[r.id,r.company,r.owner,r.title,r.importance,r.priority,r.requestDate,r.dueDate,r.actualDate,statusOptions.find(s=>s.value===r.status)?.label||r.status,r.notes||""].map(escape).join(","))).join("\n");}
function downloadFile(filename,content,type="text/plain"){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}

export default function MissionBoard(){
  const [companies,setCompanies]=useState(initialCompanies);
  const [owners,setOwners]=useState(initialOwners);
  const [rows,setRows]=useState(()=>{try{return JSON.parse(localStorage.getItem(LS_KEY)||"[]");}catch{return []}});
  const [form,setForm]=useState({id:null,company:"",owner:"",title:"",importance:2,priority:2,requestDate:"",dueDate:"",actualDate:"",status:"not_started",notes:""});
  const [filters,setFilters]=useState({q:"",company:"",owner:"",status:"",sort:"-requestDate"});

  useEffect(()=>{localStorage.setItem(LS_KEY,JSON.stringify(rows));},[rows]);

  const resetForm=()=>setForm({id:null,company:"",owner:"",title:"",importance:2,priority:2,requestDate:"",dueDate:"",actualDate:"",status:"not_started",notes:""});
  const handleSubmit=(e)=>{e.preventDefault();if(!form.company||!form.owner||!form.title){alert("من فضلك أكمل الحقول الأساسية");return;}if(form.id==null){const nextId=(rows.at(-1)?.id||0)+1;setRows([...rows,{...form,id:nextId}]);}else{setRows(rows.map(r=>r.id===form.id?{...form}:r));}resetForm();};
  const editRow=(r)=>setForm({...r}); const deleteRow=(id)=>{if(confirm("حذف المهمة؟")) setRows(rows.filter(r=>r.id!==id));};

  const filtered=useMemo(()=>{let out=[...rows];if(filters.company)out=out.filter(r=>r.company===filters.company);if(filters.owner)out=out.filter(r=>r.owner===filters.owner);if(filters.status)out=out.filter(r=>r.status===filters.status);if(filters.q){const q=filters.q.trim();out=out.filter(r=>[r.title,r.notes,r.company,r.owner].some(v=>(v||"").includes(q)));}const key=filters.sort.replace(/^-/,'');const dir=filters.sort.startsWith("-")?-1:1;out.sort((a,b)=>{const va=a[key]||"";const vb=b[key]||"";if(va===vb)return 0;return va>vb?dir:-dir;});return out;},[rows,filters]);
  const exportCSV=()=>downloadFile("missions.csv",toCSV(filtered),"text/csv;charset=utf-8");

  return (<div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 p-6"><h1 className="text-2xl font-bold mb-4">لوحة متابعة مهام الإدارة</h1><form onSubmit={handleSubmit} className="grid gap-4 bg-white rounded-xl p-4 shadow mb-6"><select value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))}><option value="">اختر الشركة</option>{companies.map(c=><option key={c}>{c}</option>)}</select><select value={form.owner} onChange={e=>setForm(f=>({...f,owner:e.target.value}))}><option value="">اختر المسئول</option>{owners.map(o=><option key={o}>{o}</option>)}</select><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="المهمة"/><select value={form.importance} onChange={e=>setForm(f=>({...f,importance:Number(e.target.value)}))}>{importanceScale.map(n=><option key={n}>{n}</option>)}</select><select value={form.priority} onChange={e=>setForm(f=>({...f,priority:Number(e.target.value)}))}>{priorityScale.map(n=><option key={n}>{n}</option>)}</select><input type="date" value={form.requestDate} onChange={e=>setForm(f=>({...f,requestDate:e.target.value}))}/><input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/><input type="date" value={form.actualDate} onChange={e=>setForm(f=>({...f,actualDate:e.target.value}))}/><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="ملاحظات"/><button className="bg-blue-600 text-white rounded px-3 py-2"><Plus size={16}/> {form.id==null?"إضافة":"تعديل"}</button><button type="button" onClick={resetForm} className="bg-gray-200 px-3 py-2 rounded">تفريغ</button></form><button onClick={exportCSV} className="mb-4 bg-green-600 text-white rounded px-3 py-2 inline-flex items-center gap-2"><Download size={16}/> تصدير CSV</button><table className="w-full text-sm bg-white rounded-xl shadow"><thead className="bg-slate-100"><tr><th>ID</th><th>الشركة</th><th>المسئول</th><th>المهمة</th><th>الأهمية</th><th>الأولوية</th><th>التواريخ</th><th>الحالة</th><th>ملاحظات</th><th>إجراءات</th></tr></thead><tbody>{filtered.map(r=>(<tr key={r.id} className="border-t"><td>{r.id}</td><td>{r.company}</td><td>{r.owner}</td><td>{r.title}</td><td>{r.importance}</td><td>{r.priority}</td><td><div>طلب: {r.requestDate||'—'}</div><div>افتراضي: {r.dueDate||'—'}</div><div>فعلي: {r.actualDate||'—'}</div></td><td>{statusOptions.find(s=>s.value===r.status)?.label}</td><td>{r.notes}</td><td><button onClick={()=>editRow(r)} className="bg-blue-200 px-2 py-1 rounded">تعديل</button><button onClick={()=>deleteRow(r.id)} className="bg-red-200 px-2 py-1 rounded ml-2">حذف</button></td></tr>))}{filtered.length===0&&<tr><td colSpan={10} className="text-center py-4">لا توجد بيانات</td></tr>}</tbody></table></div>);}
}