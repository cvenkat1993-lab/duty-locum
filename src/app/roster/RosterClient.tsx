"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Header from "@/components/Header";
import Script from "next/script";

// ── Types ────────────────────────────────────────────────────
interface ShiftType { id: string; label: string; start: string; end: string; }
interface Doctor { id: number; name: string; spec: string; color: string; minHours: number | null; maxHours: number | null; minShifts: number | null; maxShifts: number | null; leavesPerMonth: number | null; }
interface Leave { id: number; docId: number; from: string; to: string; type: string; status: string; }
interface Swap { id: number; fromId: number; toId: number; date: string; shift: string; status: string; eligible: boolean; }
type RosterDay = { M: number[]; E: number[]; N: number[]; F: number[]; [key: string]: number[] };
type Roster = Record<string, RosterDay>;

const SHIFT_ORDER = ["M","E","N","F"] as const;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SPECS = ["General Medicine","Surgery","ICU / Critical Care","Emergency","Cardiology","Neurology","Pediatrics","Orthopaedics","Anaesthesiology","Radiology","Pathology","Psychiatry"];
const LEAVE_TYPES = ["Casual Leave","Medical Leave","Conference/Training","Personal"];

const DEFAULT_SHIFTS: Record<string, ShiftType> = {
  M: { id:"M", label:"Morning",  start:"06:00", end:"14:00" },
  E: { id:"E", label:"Evening",  start:"14:00", end:"22:00" },
  N: { id:"N", label:"Night",    start:"22:00", end:"06:00" },
  F: { id:"F", label:"Full-Day", start:"08:00", end:"20:00" },
};

const SHIFT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  M: { bg:"#fff3e0", color:"#e65100", border:"#ffcc80" },
  E: { bg:"#e3f2fd", color:"#1565c0", border:"#90caf9" },
  N: { bg:"#f3e5f5", color:"#6a1b9a", border:"#ce93d8" },
  F: { bg:"#e8f5e9", color:"#2e7d32", border:"#a5d6a7" },
};

const DEFAULT_DOCTORS: Doctor[] = [
  { id:1, name:"Dr. Arjun Mehta",   spec:"General Medicine",    color:"#e65100", minHours:null, maxHours:null, minShifts:null, maxShifts:null, leavesPerMonth:null },
  { id:2, name:"Dr. Priya Nair",    spec:"Surgery",             color:"#1565c0", minHours:null, maxHours:null, minShifts:null, maxShifts:null, leavesPerMonth:null },
  { id:3, name:"Dr. Rahul Sharma",  spec:"ICU / Critical Care", color:"#6a1b9a", minHours:null, maxHours:null, minShifts:null, maxShifts:null, leavesPerMonth:null },
  { id:4, name:"Dr. Kavya Reddy",   spec:"Emergency",           color:"#2e7d32", minHours:null, maxHours:null, minShifts:null, maxShifts:null, leavesPerMonth:null },
];

export default function RosterClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  const [tab, setTab] = useState<"settings"|"doctors"|"leaves"|"roster"|"swaps">("settings");
  const [shiftTypes, setShiftTypes] = useState<Record<string, ShiftType>>({ ...DEFAULT_SHIFTS });
  const [defaults, setDefaults] = useState({ minShifts:15, maxShifts:22, minHours:120, maxHours:200, leavesPerMonth:4, restHours:10 });
  const [shiftCountLimits, setShiftCountLimits] = useState<Record<string,number|null>>({ M:null,E:null,N:null,F:null });
  const [doctors, setDoctors] = useState<Doctor[]>(DEFAULT_DOCTORS);
  const [nextDocId, setNextDocId] = useState(5);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [roster, setRoster] = useState<Roster>({});
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [rosterView, setRosterView] = useState<"cal"|"stats">("cal");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Forms
  const [dName, setDName] = useState(""); const [dSpec, setDSpec] = useState(SPECS[0]); const [dColor, setDColor] = useState("#4285F4");
  const [dMinH, setDMinH] = useState(""); const [dMaxH, setDMaxH] = useState(""); const [dMinS, setDMinS] = useState(""); const [dMaxS, setDMaxS] = useState("");
  const [stType, setStType] = useState("M"); const [stStart, setStStart] = useState("06:00"); const [stEnd, setStEnd] = useState("14:00"); const [stLabel, setStLabel] = useState("Morning");
  const [lDoc, setLDoc] = useState(0); const [lFrom, setLFrom] = useState(new Date().toISOString().split("T")[0]); const [lTo, setLTo] = useState(new Date().toISOString().split("T")[0]); const [lType, setLType] = useState(LEAVE_TYPES[0]);
  const [swapFrom, setSwapFrom] = useState(0); const [swapTo, setSwapTo] = useState(0); const [swapDate, setSwapDate] = useState(new Date().toISOString().split("T")[0]); const [swapShift, setSwapShift] = useState("M");
  const [addShiftModal, setAddShiftModal] = useState<{docId:number;date:string}|null>(null); const [addShiftType, setAddShiftType] = useState("M");
  const dragInfo = useRef<{docId:number;date:string;shift:string}|null>(null);
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db,"users",u.uid));
        if (snap.exists()) { const d=snap.data(); setProfileComplete(!!(d.name&&d.phoneNumber&&d.userType)); }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (doctors.length > 0 && lDoc === 0) setLDoc(doctors[0].id);
    if (doctors.length > 0 && swapFrom === 0) { setSwapFrom(doctors[0].id); setSwapTo(doctors[0].id); }
  }, [doctors]);

  const showToast = (msg: string, type = "ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2600); };
  const initials = (n: string) => n.replace("Dr.","").trim().split(" ").map((w:string)=>w[0]).join("").toUpperCase().slice(0,2);
  const fmtDate = (y:number,m:number,d:number) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const daysInMonth = (y:number,m:number) => new Date(y,m+1,0).getDate();
  const isWeekend = (y:number,m:number,d:number) => [0,6].includes(new Date(y,m,d).getDay());
  const dayAbbr = (y:number,m:number,d:number) => ["Su","Mo","Tu","We","Th","Fr","Sa"][new Date(y,m,d).getDay()];
  const docById = (id:number) => doctors.find(d=>d.id===id);

  const shiftHours = (s:string) => {
    const st=shiftTypes[s]; if(!st)return 0;
    const [sh,sm]=st.start.split(":").map(Number); const [eh,em]=st.end.split(":").map(Number);
    let diff=(eh*60+em)-(sh*60+sm); if(diff<=0)diff+=1440; return diff/60;
  };

  const isOnLeave = (docId:number,dateStr:string) => leaves.some(l=>l.docId===docId&&l.status==="approved"&&l.from<=dateStr&&l.to>=dateStr);

  const computeDocStats = (docId:number) => {
    let total=0,hours=0; const bySType:Record<string,number>={M:0,E:0,N:0,F:0};
    const leaveDays = leaves.filter(l=>l.docId===docId&&l.status==="approved").reduce((acc,l)=>{
      let d=new Date(l.from);const end=new Date(l.to);
      while(d<=end){acc++;d=new Date(d.getTime()+86400000);}return acc;
    },0);
    Object.entries(roster).forEach(([,day])=>{ SHIFT_ORDER.forEach(s=>{ if(day[s]?.includes(docId)){total++;hours+=shiftHours(s);bySType[s]++;} }); });
    return{total,hours,bySType,leaveDays};
  };

  const generateRoster = () => {
    if(!doctors.length){showToast("Add doctors first","err");return;}
    const newRoster:Roster={};
    const statsMap:Record<number,{total:number;hours:number;bySType:Record<string,number>}>=Object.fromEntries(doctors.map(d=>[d.id,{total:0,hours:0,bySType:{M:0,E:0,N:0,F:0}}]));
    const days=daysInMonth(currentYear,currentMonth);
    // Helper: get date string offset by N days
    const offsetDate=(dateStr:string,days:number)=>{
      const d=new Date(dateStr); d.setDate(d.getDate()+days); return d.toISOString().split("T")[0];
    };

    const canAssign=(docId:number,dateStr:string,shift:string)=>{
      if(isOnLeave(docId,dateStr))return false;
      const day=newRoster[dateStr];
      // Only one shift per day per doctor
      if(day&&SHIFT_ORDER.some(s=>day[s]?.includes(docId)))return false;
      const doc=docById(docId)!; const st=statsMap[docId];
      if(st.total>=(doc.maxShifts??defaults.maxShifts))return false;
      if(st.hours+shiftHours(shift)>(doc.maxHours??defaults.maxHours))return false;
      const lim=shiftCountLimits[shift]; if(lim!==null&&st.bySType[shift]>=lim)return false;

      // Rest constraint: if doctor had Full-Day yesterday → rest today
      const yesterday=offsetDate(dateStr,-1);
      const prevDay=newRoster[yesterday];
      if(prevDay&&prevDay["F"]?.includes(docId))return false;

      // Rest constraint: if doctor had Night shift yesterday → no Morning today
      if(prevDay&&prevDay["N"]?.includes(docId)&&shift==="M")return false;

      // Rest constraint: if doctor had Night shift yesterday → no Full-Day today
      if(prevDay&&prevDay["N"]?.includes(docId)&&shift==="F")return false;

      return true;
    };
    // Round-robin pointer per shift type — each shift slot rotates independently
    const rrPointer:Record<string,number> = {M:0, E:0, N:0, F:0};

    for(let d=1;d<=days;d++){
      const dateStr=fmtDate(currentYear,currentMonth,d);
      newRoster[dateStr]={M:[],E:[],N:[],F:[]};

      // For each shift, assign exactly one doctor using round-robin.
      // Start from the current pointer, walk the doctor list until we
      // find someone eligible, then advance the pointer.
      SHIFT_ORDER.forEach(shift=>{
        const n = doctors.length;
        let assigned = false;
        // Try each doctor once starting from the current pointer
        for(let attempt=0; attempt<n; attempt++){
          const idx = (rrPointer[shift] + attempt) % n;
          const doc = doctors[idx];
          if(canAssign(doc.id, dateStr, shift)){
            newRoster[dateStr][shift].push(doc.id);
            statsMap[doc.id].total++;
            statsMap[doc.id].hours += shiftHours(shift);
            statsMap[doc.id].bySType[shift]++;
            // Advance pointer past this doctor for next assignment
            rrPointer[shift] = (idx + 1) % n;
            assigned = true;
            break;
          }
        }
        // If no one was eligible (all on leave / all at max), leave slot empty
        if(!assigned) rrPointer[shift] = (rrPointer[shift] + 1) % n;
      });
    }
    setRoster(newRoster);showToast("Roster generated ✓");
  };

  const removeShift=(docId:number,date:string,shift:string)=>{
    setRoster(prev=>({...prev,[date]:{...prev[date],[shift]:prev[date][shift].filter(id=>id!==docId)}}));
    showToast("Shift removed");
  };

  const confirmAddShift=()=>{
    if(!addShiftModal)return;
    const{docId,date}=addShiftModal;
    if(isOnLeave(docId,date)){showToast("Doctor is on leave","err");setAddShiftModal(null);return;}
    if(SHIFT_ORDER.some(s=>roster[date]?.[s]?.includes(docId))){showToast("Already assigned","warn");setAddShiftModal(null);return;}
    setRoster(prev=>({...prev,[date]:{...(prev[date]||{M:[],E:[],N:[],F:[]}),[addShiftType]:[...(prev[date]?.[addShiftType]||[]),docId]}}));
    setAddShiftModal(null);showToast("Shift assigned ✓");
  };

  const onDragStart=(e:React.DragEvent,docId:number,date:string,shift:string)=>{dragInfo.current={docId,date,shift};e.dataTransfer.effectAllowed="move";};
  const onDrop=(e:React.DragEvent,targetDocId:number,targetDate:string)=>{
    e.preventDefault();(e.currentTarget as HTMLElement).style.background="";
    if(!dragInfo.current)return;
    const{docId:fromDocId,date:fromDate,shift}=dragInfo.current;dragInfo.current=null;
    if(fromDocId===targetDocId&&fromDate===targetDate)return;
    if(isOnLeave(targetDocId,targetDate)){showToast(`${docById(targetDocId)?.name} is on leave`,"err");return;}
    if(SHIFT_ORDER.some(s=>roster[targetDate]?.[s]?.includes(targetDocId))){showToast("Doctor already has a shift that day","warn");return;}
    setRoster(prev=>{
      const next=JSON.parse(JSON.stringify(prev));
      next[fromDate][shift]=next[fromDate][shift].filter((id:number)=>id!==fromDocId);
      if(!next[targetDate])next[targetDate]={M:[],E:[],N:[],F:[]};
      next[targetDate][shift].push(targetDocId);return next;
    });showToast("Shift moved ✓");
  };

  const handleExport=()=>{
    if(!user){if(confirm("Please login to download the roster. Go to login?"))router.push("/login");return;}
    if(!profileComplete){if(confirm("Please complete your profile first. Go to profile?"))router.push("/profile");return;}
    if(!Object.keys(roster).length){showToast("Generate roster first","err");return;}
    const XLSX=(window as any).XLSX;
    if(!XLSX){showToast("Export library loading, try again","err");return;}
    const days=daysInMonth(currentYear,currentMonth);
    const header=["Doctor","Specialization",...Array.from({length:days},(_,i)=>String(i+1)),"Total Shifts","Total Hours","Morning","Evening","Night","Full-Day"];
    const rows=[header];
    doctors.forEach(doc=>{
      const stats=computeDocStats(doc.id);
      const row:any[]=[doc.name,doc.spec];
      for(let d=1;d<=days;d++){
        const dateStr=fmtDate(currentYear,currentMonth,d);
        if(isOnLeave(doc.id,dateStr)){row.push("LEAVE");continue;}
        row.push(SHIFT_ORDER.filter(s=>roster[dateStr]?.[s]?.includes(doc.id)).map(s=>shiftTypes[s].label).join("/"));
      }
      row.push(stats.total,stats.hours.toFixed(1),stats.bySType.M,stats.bySType.E,stats.bySType.N,stats.bySType.F);
      rows.push(row);
    });
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"Roster");
    XLSX.writeFile(wb,`DutyLocum_Roster_${MONTHS[currentMonth]}_${currentYear}.xlsx`);
    showToast("Excel exported ✓");
  };

  const handlePrint=()=>{
    if(!user){if(confirm("Please login to print. Go to login?"))router.push("/login");return;}
    if(!profileComplete){if(confirm("Please complete your profile first. Go to profile?"))router.push("/profile");return;}
    window.print();
  };

  const pendingLeaves=leaves.filter(l=>l.status==="pending").length;
  const pendingSwaps=swaps.filter(s=>s.status==="pending").length;

  const navItems=[
    {key:"settings",label:"⚙️ Settings"},
    {key:"doctors", label:"👥 Doctors"},
    {key:"leaves",  label:"🏥 Leaves", badge:pendingLeaves},
    {key:"swaps",   label:"🔄 Swaps",  badge:pendingSwaps},
    {key:"roster",  label:"📅 Roster"},
  ];

  const SectionTitle=({children}:{children:React.ReactNode})=>(
    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--text-secondary)",marginBottom:12}}>{children}</div>
  );

  const statusColors:Record<string,{bg:string;color:string}>={
    pending:{bg:"#fff3e0",color:"#e65100"}, approved:{bg:"#e8f5e9",color:"#2e7d32"},
    accepted:{bg:"#e8f5e9",color:"#2e7d32"}, rejected:{bg:"#ffebee",color:"#c62828"},
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" />

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,
          background:toast.type==="err"?"var(--danger)":toast.type==="warn"?"#f57c00":"#333",
          color:"white",padding:"10px 18px",borderRadius:8,fontSize:13,fontWeight:600,
          boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
          {toast.msg}
        </div>
      )}

      {/* Add shift modal */}
      {addShiftModal&&(
        <div onClick={()=>setAddShiftModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} className="card" style={{width:"100%",maxWidth:400,margin:0}}>
            <h3 style={{marginBottom:8}}>Assign Shift</h3>
            <p style={{fontSize:13,color:"var(--text-secondary)",marginBottom:16}}>
              {docById(addShiftModal.docId)?.name} on {addShiftModal.date}
            </p>
            <div className="form-group">
              <label className="form-label">Shift Type</label>
              <select value={addShiftType} onChange={e=>setAddShiftType(e.target.value)}>
                {SHIFT_ORDER.map(s=><option key={s} value={s}>{shiftTypes[s].label} ({shiftTypes[s].start}–{shiftTypes[s].end})</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
              <button onClick={()=>setAddShiftModal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={confirmAddShift} className="btn btn-primary">Assign</button>
            </div>
          </div>
        </div>
      )}

      <div style={{minHeight:"100vh",background:"#f9f9f9"}}>
        <Header/>

        {/* Page header */}
        <div style={{background:"white",borderBottom:"1px solid var(--border)",padding:"16px 20px"}}>
          <div className="container" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <h1 style={{margin:0,fontSize:22}}>Roster Scheduler</h1>
              <p style={{margin:0,fontSize:13,color:"var(--text-secondary)"}}>
                Auto-generate and manage monthly doctor duty rosters
              </p>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={handleExport} className="btn btn-secondary" style={{fontSize:13}}>
                ⬇ Export Excel {!user&&<span style={{fontSize:11,opacity:0.7}}>(login)</span>}
              </button>
              <button onClick={handlePrint} className="btn btn-secondary" style={{fontSize:13}}>
                🖨 Print {!user&&<span style={{fontSize:11,opacity:0.7}}>(login)</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div style={{background:"white",borderBottom:"1px solid var(--border)",overflowX:"auto",display:"flex",padding:"0 4px"}} className="show-mobile">
          {navItems.map(item=>(
            <button key={item.key} onClick={()=>setTab(item.key as any)} style={{
              padding:"12px 14px",border:"none",background:"none",cursor:"pointer",
              fontSize:12,fontWeight:600,whiteSpace:"nowrap",
              color:tab===item.key?"var(--primary)":"var(--text-secondary)",
              borderBottom:`2px solid ${tab===item.key?"var(--primary)":"transparent"}`,
              position:"relative",
            }}>
              {item.label}
              {!!item.badge&&<span style={{position:"absolute",top:6,right:4,background:"var(--danger)",color:"white",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="container" style={{paddingTop:24,paddingBottom:40}}>
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:24,alignItems:"start"}} className="roster-layout">

            {/* Desktop sidebar nav */}
            <div className="card hide-mobile" style={{padding:8,position:"sticky",top:80}}>
              {navItems.map(item=>(
                <button key={item.key} onClick={()=>setTab(item.key as any)} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  width:"100%",padding:"10px 12px",border:"none",borderRadius:6,cursor:"pointer",
                  fontSize:13,fontWeight:600,textAlign:"left",
                  background:tab===item.key?"#e8f0fe":"transparent",
                  color:tab===item.key?"var(--primary)":"var(--foreground)",
                  marginBottom:2,
                }}>
                  <span>{item.label}</span>
                  {!!item.badge&&<span style={{background:"var(--danger)",color:"white",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>{item.badge}</span>}
                </button>
              ))}
              <div style={{marginTop:12,padding:"12px 8px",borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-secondary)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span>Doctors</span><strong>{doctors.length}</strong></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span>Pending Leaves</span><strong style={{color:pendingLeaves?"var(--danger)":"inherit"}}>{pendingLeaves}</strong></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Pending Swaps</span><strong style={{color:pendingSwaps?"var(--danger)":"inherit"}}>{pendingSwaps}</strong></div>
              </div>
            </div>

            {/* Main content */}
            <div>

              {/* ── ROSTER TAB ── */}
              {tab==="roster"&&(
                <div>
                  {/* Stats strip */}
                  {Object.keys(roster).length>0&&(()=>{
                    const sm=Object.fromEntries(doctors.map(d=>[d.id,computeDocStats(d.id)]));
                    const totalShifts=Object.values(sm).reduce((a,s)=>a+s.total,0);
                    const totalHours=Object.values(sm).reduce((a,s)=>a+s.hours,0);
                    const violations=doctors.filter(d=>{const s=sm[d.id];return s.hours<(d.minHours??defaults.minHours)||s.hours>(d.maxHours??defaults.maxHours)||s.total<(d.minShifts??defaults.minShifts)||s.total>(d.maxShifts??defaults.maxShifts);}).length;
                    return(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
                        {[{l:"Total Shifts",v:totalShifts,s:`${doctors.length} doctors`},{l:"Total Hours",v:totalHours.toFixed(0),s:"dept total"},{l:"Days",v:daysInMonth(currentYear,currentMonth),s:String(currentYear)},{l:"Violations",v:violations,s:"limit breaches",warn:violations>0}].map(c=>(
                          <div key={c.l} className="card" style={{padding:"12px 16px",marginBottom:0}}>
                            <div style={{fontSize:11,color:"var(--text-secondary)",fontWeight:600,marginBottom:4}}>{c.l}</div>
                            <div style={{fontSize:24,fontWeight:700,color:c.warn?"var(--danger)":"inherit"}}>{c.v}</div>
                            <div style={{fontSize:11,color:"var(--text-secondary)"}}>{c.s}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Controls */}
                  <div className="card" style={{marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button onClick={()=>{setCurrentMonth(m=>{const n=m-1;if(n<0){setCurrentYear(y=>y-1);return 11;}return n;});setRoster({});}} className="btn btn-secondary" style={{padding:"6px 10px"}}>‹</button>
                        <span style={{fontWeight:700,minWidth:140,textAlign:"center"}}>{MONTHS[currentMonth]} {currentYear}</span>
                        <button onClick={()=>{setCurrentMonth(m=>{const n=m+1;if(n>11){setCurrentYear(y=>y+1);return 0;}return n;});setRoster({});}} className="btn btn-secondary" style={{padding:"6px 10px"}}>›</button>
                      </div>
                      <button onClick={generateRoster} className="btn btn-primary" style={{fontSize:13}}>⚡ Auto-Generate</button>
                      <div style={{display:"flex",gap:4}}>
                        {(["cal","stats"] as const).map(v=>(
                          <button key={v} onClick={()=>setRosterView(v)} className={`btn ${rosterView===v?"btn-primary":"btn-secondary"}`} style={{padding:"6px 12px",fontSize:12}}>
                            {v==="cal"?"Calendar":"Stats"}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Legend */}
                    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                      {Object.values(shiftTypes).map(s=>{
                        const c=SHIFT_COLORS[s.id];
                        return<span key={s.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"var(--text-secondary)"}}>
                          <span style={{width:10,height:10,borderRadius:2,background:c?.color,display:"inline-block"}}></span>{s.label}
                        </span>;
                      })}
                      <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"var(--text-secondary)"}}>
                        <span style={{width:10,height:10,borderRadius:2,background:"var(--danger)",display:"inline-block"}}></span>Leave
                      </span>
                      <span style={{fontSize:11,color:"var(--text-secondary)",marginLeft:"auto"}}>Drag pills to move shifts</span>
                    </div>
                  </div>

                  {!Object.keys(roster).length?(
                    <div className="card" style={{textAlign:"center",padding:60}}>
                      <div style={{fontSize:40,marginBottom:12}}>📅</div>
                      <h3>No roster generated yet</h3>
                      <p style={{color:"var(--text-secondary)"}}>Click ⚡ Auto-Generate to build the monthly roster</p>
                    </div>
                  ):rosterView==="cal"?(
                    /* Calendar */
                    <div style={{overflowX:"auto",borderRadius:8,border:"1px solid var(--border)",boxShadow:"var(--shadow)"}}>
                      <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
                        <thead>
                          <tr>
                            <th style={{background:"#333",color:"white",padding:"8px 12px",fontSize:11,fontWeight:700,textAlign:"left",minWidth:140,position:"sticky",top:0,zIndex:10,whiteSpace:"nowrap"}}>Doctor</th>
                            {Array.from({length:daysInMonth(currentYear,currentMonth)},(_,i)=>i+1).map(d=>(
                              <th key={d} style={{background:isWeekend(currentYear,currentMonth,d)?"#555":"#333",color:isWeekend(currentYear,currentMonth,d)?"#ffd54f":"white",padding:"6px 3px",fontSize:9,fontWeight:700,textAlign:"center",whiteSpace:"nowrap",position:"sticky",top:0,zIndex:10,minWidth:38}}>
                                {d}<br/>{dayAbbr(currentYear,currentMonth,d)}
                              </th>
                            ))}
                            <th style={{background:"#444",color:"white",padding:"6px 4px",fontSize:9,fontWeight:700,minWidth:68,position:"sticky",top:0,zIndex:10}}>Hours</th>
                            <th style={{background:"#444",color:"white",padding:"6px 4px",fontSize:9,fontWeight:700,minWidth:56,position:"sticky",top:0,zIndex:10}}>Shifts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctors.map(doc=>{
                            const stats=computeDocStats(doc.id);
                            const minH=doc.minHours??defaults.minHours,maxH=doc.maxHours??defaults.maxHours;
                            const minS=doc.minShifts??defaults.minShifts,maxS=doc.maxShifts??defaults.maxShifts;
                            const pct=Math.min(100,(stats.hours/maxH)*100);
                            const fillColor=stats.hours<minH?"#90a4ae":stats.hours>maxH?"var(--danger)":stats.hours>maxH*0.9?"var(--warning)":"var(--success)";
                            const hVio=stats.hours<minH||stats.hours>maxH;
                            const sVio=stats.total<minS||stats.total>maxS;
                            return(
                              <tr key={doc.id} style={{borderBottom:"1px solid #f0f0f0"}}>
                                <td style={{padding:"6px 10px",background:"white",fontWeight:700,fontSize:11,whiteSpace:"nowrap",borderRight:"2px solid var(--border)"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <div style={{width:24,height:24,borderRadius:"50%",background:`${doc.color}20`,color:doc.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{initials(doc.name)}</div>
                                    {doc.name.replace("Dr. ","Dr.")}
                                  </div>
                                </td>
                                {Array.from({length:daysInMonth(currentYear,currentMonth)},(_,i)=>i+1).map(d=>{
                                  const dateStr=fmtDate(currentYear,currentMonth,d);
                                  const onLeave=isOnLeave(doc.id,dateStr);
                                  return(
                                    <td key={d} style={{padding:2,borderRight:"1px solid #f5f5f5",verticalAlign:"top"}}>
                                      <div style={{minHeight:42,padding:1,display:"flex",flexDirection:"column",gap:1}}
                                        onDragOver={e=>{e.preventDefault();(e.currentTarget as HTMLElement).style.background="#e8f0fe";}}
                                        onDragLeave={e=>{(e.currentTarget as HTMLElement).style.background="";}}
                                        onDrop={e=>onDrop(e,doc.id,dateStr)}>
                                        {onLeave?(
                                          <div style={{padding:"2px 4px",borderRadius:3,fontSize:8,background:"#ffebee",color:"var(--danger)",border:"1px solid #ffcdd2",fontWeight:700}}>LEAVE</div>
                                        ):(
                                          SHIFT_ORDER.filter(s=>roster[dateStr]?.[s]?.includes(doc.id)).map(s=>{
                                            const c=SHIFT_COLORS[s];
                                            return(
                                              <div key={s} draggable onDragStart={e=>onDragStart(e,doc.id,dateStr,s)}
                                                style={{padding:"2px 4px",borderRadius:3,fontSize:8,cursor:"grab",display:"flex",alignItems:"center",justifyContent:"space-between",gap:2,background:c.bg,color:c.color,border:`1px solid ${c.border}`,fontWeight:700}}>
                                                {shiftTypes[s].label.slice(0,3)}
                                                <span onClick={()=>removeShift(doc.id,dateStr,s)} style={{cursor:"pointer",fontSize:7,opacity:0.7}}>✕</span>
                                              </div>
                                            );
                                          })
                                        )}
                                        {!onLeave&&!SHIFT_ORDER.some(s=>roster[dateStr]?.[s]?.includes(doc.id))&&(
                                          <div onClick={()=>{setAddShiftModal({docId:doc.id,date:dateStr});setAddShiftType("M");}}
                                            style={{fontSize:8,color:"#ccc",cursor:"pointer",textAlign:"center",padding:2,border:"1px dashed #ddd",borderRadius:3}}>+</div>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td style={{padding:"4px 6px",background:"white",fontSize:10,whiteSpace:"nowrap",borderRight:"1px solid var(--border)"}}>
                                  <div style={{fontWeight:700,color:hVio?"var(--danger)":"inherit"}}>{stats.hours.toFixed(1)}h</div>
                                  <div style={{height:3,borderRadius:2,background:"#eee",marginTop:2}}>
                                    <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:fillColor}}></div>
                                  </div>
                                  <div style={{fontSize:9,color:"var(--text-secondary)"}}>{minH}–{maxH}h</div>
                                </td>
                                <td style={{padding:"4px 6px",background:"white",fontSize:10}}>
                                  <div style={{fontWeight:700,color:sVio?"var(--danger)":"inherit"}}>{stats.total}</div>
                                  <div style={{fontSize:9,color:"var(--text-secondary)"}}>{minS}–{maxS}</div>
                                  <span style={{fontSize:9,padding:"1px 4px",borderRadius:3,fontWeight:700,background:sVio?"#ffebee":"#e8f5e9",color:sVio?"var(--danger)":"var(--success)"}}>
                                    {sVio?"!":"✓"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ):(
                    /* Stats view */
                    <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                        <thead>
                          <tr style={{borderBottom:"2px solid var(--border)",background:"#f9f9f9"}}>
                            {["Doctor","Hours","Shifts","M","E","N","F","Leaves","Status"].map(h=>(
                              <th key={h} style={{padding:"10px 12px",fontSize:11,textTransform:"uppercase",letterSpacing:0.8,color:"var(--text-secondary)",textAlign:h==="Doctor"?"left":"center",fontWeight:700}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {doctors.map(doc=>{
                            const s=computeDocStats(doc.id);
                            const minH=doc.minHours??defaults.minHours,maxH=doc.maxHours??defaults.maxHours;
                            const minS=doc.minShifts??defaults.minShifts,maxS=doc.maxShifts??defaults.maxShifts;
                            const ok=s.hours>=minH&&s.hours<=maxH&&s.total>=minS&&s.total<=maxS;
                            return(
                              <tr key={doc.id} style={{borderBottom:"1px solid var(--border)"}}>
                                <td style={{padding:"10px 12px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <div style={{width:28,height:28,borderRadius:"50%",background:`${doc.color}20`,color:doc.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{initials(doc.name)}</div>
                                    <div><div style={{fontWeight:600,fontSize:13}}>{doc.name}</div><div style={{fontSize:11,color:"var(--text-secondary)"}}>{doc.spec}</div></div>
                                  </div>
                                </td>
                                <td style={{textAlign:"center",padding:"10px 8px"}}>
                                  <span style={{fontWeight:700,color:(s.hours<minH||s.hours>maxH)?"var(--danger)":"inherit"}}>{s.hours.toFixed(1)}</span>
                                  <div style={{fontSize:10,color:"var(--text-secondary)"}}>{minH}–{maxH}h</div>
                                </td>
                                <td style={{textAlign:"center",padding:"10px 8px",fontWeight:700,color:(s.total<minS||s.total>maxS)?"var(--danger)":"inherit"}}>
                                  {s.total}<div style={{fontSize:10,color:"var(--text-secondary)",fontWeight:400}}>{minS}–{maxS}</div>
                                </td>
                                {(["M","E","N","F"] as const).map(sh=>(
                                  <td key={sh} style={{textAlign:"center",padding:"10px 6px",fontWeight:700,color:SHIFT_COLORS[sh]?.color}}>{s.bySType[sh]}</td>
                                ))}
                                <td style={{textAlign:"center",padding:"10px 8px",color:"var(--text-secondary)"}}>{s.leaveDays}</td>
                                <td style={{textAlign:"center",padding:"10px 8px"}}>
                                  <span className={`badge ${ok?"badge-accepted":"badge-rejected"}`}>{ok?"OK":"REVIEW"}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── DOCTORS TAB ── */}
              {tab==="doctors"&&(
                <div>
                  <div className="card">
                    <SectionTitle>Add Doctor</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Name</label><input type="text" value={dName} onChange={e=>setDName(e.target.value)} placeholder="Dr. Full Name"/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Specialization</label><select value={dSpec} onChange={e=>setDSpec(e.target.value)}>{SPECS.map(s=><option key={s}>{s}</option>)}</select></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Min Hrs/mo</label><input type="number" value={dMinH} onChange={e=>setDMinH(e.target.value)} placeholder={String(defaults.minHours)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Max Hrs/mo</label><input type="number" value={dMaxH} onChange={e=>setDMaxH(e.target.value)} placeholder={String(defaults.maxHours)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Min Shifts/mo</label><input type="number" value={dMinS} onChange={e=>setDMinS(e.target.value)} placeholder={String(defaults.minShifts)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Max Shifts/mo</label><input type="number" value={dMaxS} onChange={e=>setDMaxS(e.target.value)} placeholder={String(defaults.maxShifts)}/></div>
                      <div className="form-group" style={{marginBottom:0}}>
                        <label className="form-label">Colour</label>
                        <input type="color" value={dColor} onChange={e=>setDColor(e.target.value)} style={{height:42,padding:4,cursor:"pointer"}}/>
                      </div>
                    </div>
                    <button onClick={()=>{if(!dName.trim()){showToast("Enter a name","err");return;}setDoctors(p=>[...p,{id:nextDocId,name:dName.trim(),spec:dSpec,color:dColor,minHours:dMinH?+dMinH:null,maxHours:dMaxH?+dMaxH:null,minShifts:dMinS?+dMinS:null,maxShifts:dMaxS?+dMaxS:null,leavesPerMonth:null}]);setNextDocId(n=>n+1);setDName("");showToast("Doctor added ✓");}} className="btn btn-primary" style={{marginTop:16}}>+ Add Doctor</button>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                    {doctors.map(doc=>(
                      <div key={doc.id} className="card" style={{marginBottom:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                          <div style={{width:40,height:40,borderRadius:"50%",background:`${doc.color}20`,color:doc.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>{initials(doc.name)}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700}}>{doc.name}</div>
                            <div style={{fontSize:12,color:"var(--text-secondary)"}}>{doc.spec}</div>
                          </div>
                          <button onClick={()=>setDoctors(p=>p.filter(d=>d.id!==doc.id))} className="btn btn-danger" style={{padding:"4px 8px",fontSize:12}}>✕</button>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          {[["Min Hrs",doc.minHours??defaults.minHours],["Max Hrs",doc.maxHours??defaults.maxHours],["Min Shifts",doc.minShifts??defaults.minShifts],["Max Shifts",doc.maxShifts??defaults.maxShifts]].map(([l,v])=>(
                            <div key={l as string} style={{background:"#f5f5f5",borderRadius:6,padding:"6px 10px"}}>
                              <div style={{fontSize:10,color:"var(--text-secondary)",fontWeight:600}}>{l}</div>
                              <div style={{fontWeight:700,fontSize:14}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LEAVES TAB ── */}
              {tab==="leaves"&&(
                <div>
                  <div className="card">
                    <SectionTitle>Submit Leave Request</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Doctor</label><select value={lDoc} onChange={e=>setLDoc(+e.target.value)}>{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">From</label><input type="date" value={lFrom} onChange={e=>setLFrom(e.target.value)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">To</label><input type="date" value={lTo} onChange={e=>setLTo(e.target.value)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Type</label><select value={lType} onChange={e=>setLType(e.target.value)}>{LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                    </div>
                    <button onClick={()=>{if(!lFrom||!lTo){showToast("Pick dates","err");return;}if(lFrom>lTo){showToast("From must be before To","err");return;}setLeaves(p=>[...p,{id:Date.now(),docId:lDoc||doctors[0]?.id||0,from:lFrom,to:lTo,type:lType,status:"pending"}]);showToast("Leave submitted ✓");}} className="btn btn-primary" style={{marginTop:16}}>Submit Request</button>
                  </div>
                  {!leaves.length?(
                    <div className="card" style={{textAlign:"center",padding:40,color:"var(--text-secondary)"}}>No leave requests yet.</div>
                  ):[...leaves].reverse().map(l=>{
                    const d=docById(l.docId)||doctors[0];if(!d)return null;
                    const sc=statusColors[l.status]||statusColors.pending;
                    return(
                      <div key={l.id} className="card" style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:`${d.color}20`,color:d.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{initials(d.name)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:14}}>{d.name}</div>
                          <div style={{fontSize:12,color:"var(--text-secondary)"}}>{l.type} · {l.from} → {l.to}</div>
                        </div>
                        <span className="badge" style={{background:sc.bg,color:sc.color}}>{l.status}</span>
                        {l.status==="pending"&&(
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>setLeaves(p=>p.map(x=>x.id===l.id?{...x,status:"approved"}:x))} className="btn btn-secondary" style={{fontSize:12,padding:"6px 10px"}}>Approve</button>
                            <button onClick={()=>setLeaves(p=>p.map(x=>x.id===l.id?{...x,status:"rejected"}:x))} className="btn btn-danger" style={{fontSize:12,padding:"6px 10px"}}>Reject</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SWAPS TAB ── */}
              {tab==="swaps"&&(
                <div>
                  <div className="card">
                    <SectionTitle>New Swap Request</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">From Doctor</label><select value={swapFrom} onChange={e=>setSwapFrom(+e.target.value)}>{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Date</label><input type="date" value={swapDate} onChange={e=>setSwapDate(e.target.value)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Shift</label><select value={swapShift} onChange={e=>setSwapShift(e.target.value)}>{SHIFT_ORDER.map(s=><option key={s} value={s}>{shiftTypes[s].label}</option>)}</select></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Swap With</label><select value={swapTo} onChange={e=>setSwapTo(+e.target.value)}>{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                    </div>
                    <button onClick={()=>{if(!swapDate){showToast("Pick a date","err");return;}if(swapFrom===swapTo){showToast("Choose different doctors","err");return;}const eligible=!isOnLeave(swapTo,swapDate)&&!SHIFT_ORDER.some(s=>roster[swapDate]?.[s]?.includes(swapTo));setSwaps(p=>[...p,{id:Date.now(),fromId:swapFrom,toId:swapTo,date:swapDate,shift:swapShift,status:"pending",eligible}]);showToast(eligible?"Swap proposed ✓":"Proposed — conflict flagged","warn");}} className="btn btn-primary" style={{marginTop:16}}>Request Swap</button>
                  </div>
                  {!swaps.length?(
                    <div className="card" style={{textAlign:"center",padding:40,color:"var(--text-secondary)"}}>No swap requests yet.</div>
                  ):swaps.map(sw=>{
                    const from=docById(sw.fromId),to=docById(sw.toId);if(!from||!to)return null;
                    const sc=statusColors[sw.status]||statusColors.pending;
                    return(
                      <div key={sw.id} className="card" style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:`${from.color}20`,color:from.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{initials(from.name)}</div>
                        <div style={{flex:1,fontSize:13}}>
                          <strong>{from.name}</strong> → <strong>{to.name}</strong>
                          <div style={{fontSize:11,color:"var(--text-secondary)"}}>{shiftTypes[sw.shift]?.label} · {sw.date}{!sw.eligible?" · ⚠ conflict":""}</div>
                        </div>
                        <span className="badge" style={{background:sc.bg,color:sc.color}}>{sw.status}</span>
                        {sw.status==="pending"&&(
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{setSwaps(p=>p.map(s=>s.id===sw.id?{...s,status:"accepted"}:s));if(sw.eligible){setRoster(prev=>{const next=JSON.parse(JSON.stringify(prev));const day=next[sw.date];if(day&&day[sw.shift]){const idx=day[sw.shift].indexOf(sw.fromId);if(idx!==-1){day[sw.shift].splice(idx,1);day[sw.shift].push(sw.toId);}}return next;});}showToast("Swap accepted ✓");}} className="btn btn-secondary" style={{fontSize:12,padding:"6px 10px"}}>Accept</button>
                            <button onClick={()=>{setSwaps(p=>p.map(s=>s.id===sw.id?{...s,status:"rejected"}:s));showToast("Rejected");}} className="btn btn-danger" style={{fontSize:12,padding:"6px 10px"}}>Reject</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {tab==="settings"&&(
                <div>
                  <div className="card">
                    <SectionTitle>Shift Types & Timings</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
                      {Object.values(shiftTypes).map(s=>{
                        const c=SHIFT_COLORS[s.id];
                        return(
                          <div key={s.id} style={{borderRadius:8,padding:14,border:`1.5px solid ${c?.border||"var(--border)"}`,background:c?.bg||"white"}}>
                            <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:c?.color}}>{s.label}</div>
                            <div style={{fontFamily:"monospace",fontSize:12,color:"var(--text-secondary)"}}>{s.start} — {s.end}</div>
                            <div style={{fontSize:11,color:"var(--text-secondary)",marginTop:4}}>{shiftHours(s.id).toFixed(1)} hrs/shift</div>
                          </div>
                        );
                      })}
                    </div>
                    <SectionTitle>Edit Shift Type</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Shift</label><select value={stType} onChange={e=>{setStType(e.target.value);const s=shiftTypes[e.target.value];setStStart(s.start);setStEnd(s.end);setStLabel(s.label);}}>{SHIFT_ORDER.map(s=><option key={s} value={s}>{shiftTypes[s].label}</option>)}</select></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Start</label><input type="time" value={stStart} onChange={e=>setStStart(e.target.value)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">End</label><input type="time" value={stEnd} onChange={e=>setStEnd(e.target.value)}/></div>
                      <div className="form-group" style={{marginBottom:0}}><label className="form-label">Label</label><input type="text" value={stLabel} onChange={e=>setStLabel(e.target.value)}/></div>
                    </div>
                    <button onClick={()=>{setShiftTypes(p=>({...p,[stType]:{...p[stType],start:stStart,end:stEnd,label:stLabel}}));showToast(`${stLabel} updated ✓`);}} className="btn btn-primary" style={{marginTop:16}}>Save Shift Type</button>
                  </div>

                  <div className="card">
                    <SectionTitle>Department Defaults</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
                      {([["Min Shifts/Month","minShifts"],["Max Shifts/Month","maxShifts"],["Min Hours/Month","minHours"],["Max Hours/Month","maxHours"],["Leaves/Month","leavesPerMonth"],["Min Rest (hrs)","restHours"]] as [string,keyof typeof defaults][]).map(([label,key])=>(
                        <div key={key} className="form-group" style={{marginBottom:0}}>
                          <label className="form-label">{label}</label>
                          <input type="number" value={defaults[key]} onChange={e=>setDefaults(p=>({...p,[key]:+e.target.value}))}/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .roster-layout { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        @media print {
          header, .show-mobile, .hide-mobile, button, .card:first-child { display: none !important; }
        }
      `}</style>
    </>
  );
}
