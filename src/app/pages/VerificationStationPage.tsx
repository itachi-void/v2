import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  QrCode, ScanLine, Camera, Upload, Cpu, CheckCircle, XCircle,
  Truck, User, Package, Sparkles, ArrowRight, RotateCcw, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useVerificationHistory } from "@/app/contexts/VerificationHistoryContext";

/* =========================================================================
 * Verification Station — center employee intake flow
 *   1) Receive orders delivered by drivers
 *   2) Scan the bag's QR code to load the citizen's submission
 *   3) Photograph the bottles
 *   4) AI compares employee photos vs the citizen's original photos
 * Everything AI / QR / camera related is MOCKED (no backend).
 * ======================================================================= */

interface IncomingOrder {
  id: string;
  bagQr: string;
  citizenName: string;
  driverName: string;
  expectedType: string;
  expectedQty: number;
  expectedWeightKg: number;
  pointsToAward: number;
  /** Photos the citizen submitted from home. */
  citizenPhotos: string[];
}

const SAMPLE_BOTTLE_PHOTOS = [
  "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400",
  "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400",
  "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400",
  "https://images.unsplash.com/photo-1572098661174-87690fb6c527?w=400",
];

const seed: IncomingOrder[] = [
  {
    id: "ORD-4821", bagQr: "QR-EV-4821-A", citizenName: "Ahmed Hassan", driverName: "Mostafa Adel",
    expectedType: "PET", expectedQty: 6, expectedWeightKg: 0.6, pointsToAward: 60,
    citizenPhotos: [SAMPLE_BOTTLE_PHOTOS[0], SAMPLE_BOTTLE_PHOTOS[1]],
  },
  {
    id: "ORD-4822", bagQr: "QR-EV-4822-B", citizenName: "Fatma Mohamed", driverName: "Mostafa Adel",
    expectedType: "HDPE", expectedQty: 4, expectedWeightKg: 0.4, pointsToAward: 40,
    citizenPhotos: [SAMPLE_BOTTLE_PHOTOS[2]],
  },
  {
    id: "ORD-4823", bagQr: "QR-EV-4823-C", citizenName: "Omar Ali", driverName: "Hany Saeed",
    expectedType: "PET", expectedQty: 9, expectedWeightKg: 0.9, pointsToAward: 90,
    citizenPhotos: [SAMPLE_BOTTLE_PHOTOS[3], SAMPLE_BOTTLE_PHOTOS[0], SAMPLE_BOTTLE_PHOTOS[1]],
  },
];

type Step = "scan" | "capture" | "analyze" | "result";
type Resolution = "verified" | "rejected";

interface AiResult {
  matchScore: number;        // 0..100 similarity between citizen & employee photos
  detectedQty: number;
  detectedWeightKg: number;
  flags: string[];
  recommend: "approve" | "review" | "reject";
}

export default function VerificationStationPage() {
  const [orders, setOrders] = useState<IncomingOrder[]>(seed);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [activeId, setActiveId] = useState<string | null>(seed[0]?.id ?? null);

  const active = orders.find((o) => o.id === activeId) ?? null;

  const pendingCount = orders.filter((o) => !resolved[o.id]).length;
  const verifiedCount = Object.values(resolved).filter((r) => r === "verified").length;
  const rejectedCount = Object.values(resolved).filter((r) => r === "rejected").length;

  const onResolve = (id: string, res: Resolution) => {
    setResolved((p) => ({ ...p, [id]: res }));
    // auto-advance to next pending order
    const next = orders.find((o) => o.id !== id && !resolved[o.id]);
    setActiveId(next?.id ?? id);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Verification Station
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Scan delivered bags, photograph the bottles, and let AI verify against the citizen’s submission.
          </p>
        </div>
        <div className="flex gap-3">
          <StatPill label="In Queue" value={pendingCount} accent="amber" />
          <StatPill label="Verified" value={verifiedCount} accent="emerald" />
          <StatPill label="Rejected" value={rejectedCount} accent="rose" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Queue */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-white/40" style={{ fontWeight: 700 }}>
            Incoming from drivers
          </div>
          {orders.map((o) => {
            const res = resolved[o.id];
            const isActive = o.id === activeId;
            return (
              <button
                key={o.id}
                onClick={() => setActiveId(o.id)}
                className={`w-full text-left rounded-2xl p-4 border transition-all ${
                  isActive
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>{o.id}</span>
                  {res === "verified" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" style={{ fontWeight: 700 }}>VERIFIED</span>}
                  {res === "rejected" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300" style={{ fontWeight: 700 }}>REJECTED</span>}
                  {!res && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300" style={{ fontWeight: 700 }}>PENDING</span>}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <User className="w-3 h-3" /> {o.citizenName}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Truck className="w-3 h-3" /> {o.driverName}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Package className="w-3 h-3" /> {o.expectedQty}× {o.expectedType} · {o.expectedWeightKg} kg
                </div>
              </button>
            );
          })}
        </div>

        {/* Workspace */}
        <div>
          {active ? (
            <VerificationFlow
              key={active.id}
              order={active}
              resolution={resolved[active.id]}
              onResolve={onResolve}
            />
          ) : (
            <GlassCard className="p-12 text-center text-slate-400">
              Select an order to begin.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function VerificationFlow({
  order,
  resolution,
  onResolve,
}: {
  order: IncomingOrder;
  resolution?: Resolution;
  onResolve: (id: string, res: Resolution) => void;
}) {
  const { user } = useAuth();
  const { addEntry } = useVerificationHistory();
  const [step, setStep] = useState<Step>("scan");
  const [scanning, setScanning] = useState(false);
  const [employeePhotos, setEmployeePhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AiResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("scan");
    setScanning(false);
    setEmployeePhotos([]);
    setAnalyzing(false);
    setProgress(0);
    setResult(null);
  };

  // ── Step 1: scan QR (mock) ──
  const doScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success(`Bag ${order.bagQr} matched to ${order.id}`);
      setStep("capture");
    }, 1700);
  };

  // ── Step 2: capture / upload photos ──
  const addSample = () => {
    const pic = SAMPLE_BOTTLE_PHOTOS[employeePhotos.length % SAMPLE_BOTTLE_PHOTOS.length];
    setEmployeePhotos((p) => [...p, pic]);
  };
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setEmployeePhotos((p) => [...p, ...urls]);
    e.target.value = "";
  };

  // ── Step 3: AI comparison (mock) ──
  const runAi = () => {
    setStep("analyze");
    setAnalyzing(true);
    setProgress(0);
    const start = performance.now();
    const DURATION = 2600;
    const tick = () => {
      const p = Math.min(100, ((performance.now() - start) / DURATION) * 100);
      setProgress(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setAnalyzing(false);
        setResult(computeResult(order, employeePhotos.length));
        setStep("result");
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <GlassCard className="p-6">
      {/* Step indicator */}
      <StepIndicator step={step} />

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* STEP 1 — SCAN */}
          {step === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center py-8">
              <div className="relative w-44 h-44 rounded-3xl border-2 border-dashed border-emerald-400/50 flex items-center justify-center overflow-hidden bg-emerald-500/5">
                <QrCode className="w-20 h-20 text-emerald-500/70" />
                {scanning && (
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)]"
                    initial={{ top: "8%" }}
                    animate={{ top: ["8%", "92%", "8%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Bag QR: <span className="font-mono text-slate-700 dark:text-slate-200">{order.bagQr}</span>
              </p>
              <button
                onClick={doScan}
                disabled={scanning}
                className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                <ScanLine className="w-4 h-4" />
                {scanning ? "Scanning…" : "Scan Bag QR"}
              </button>
            </motion.div>
          )}

          {/* STEP 2 — CAPTURE */}
          {step === "capture" && (
            <motion.div key="capture" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Citizen reference */}
                <div>
                  <div className="text-xs text-slate-400 dark:text-white/40 mb-2 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                    <User className="w-3.5 h-3.5" /> CITIZEN’S SUBMISSION
                  </div>
                  <PhotoGrid photos={order.citizenPhotos} emptyLabel="No photos" />
                </div>
                {/* Employee capture */}
                <div>
                  <div className="text-xs text-slate-400 dark:text-white/40 mb-2 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                    <Camera className="w-3.5 h-3.5" /> YOUR PHOTOS OF THE BOTTLES
                  </div>
                  <PhotoGrid photos={employeePhotos} emptyLabel="Capture the bottles you received" />
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs transition-opacity hover:opacity-90" style={{ fontWeight: 600 }}>
                      <Upload className="w-3.5 h-3.5" /> Take / Upload
                    </button>
                    <button onClick={addSample} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs hover:border-emerald-300 transition-colors" style={{ fontWeight: 600 }}>
                      <ImageIcon className="w-3.5 h-3.5" /> Use sample
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={onFiles} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={runAi}
                  disabled={employeePhotos.length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm transition-all disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  <Cpu className="w-4 h-4" /> Run AI Comparison <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — ANALYZE */}
          {step === "analyze" && (
            <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center py-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Cpu className="w-16 h-16 text-violet-500" />
              </motion.div>
              <p className="mt-5 text-sm text-slate-600 dark:text-slate-300" style={{ fontWeight: 600 }}>
                Comparing {employeePhotos.length} photo(s) against the citizen’s submission…
              </p>
              <div className="mt-4 w-64 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{Math.round(progress)}%</p>
            </motion.div>
          )}

          {/* STEP 4 — RESULT */}
          {step === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ResultView order={order} result={result} employeePhotos={employeePhotos} />
              {!resolution ? (
                <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                  <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs hover:border-slate-400 transition-colors" style={{ fontWeight: 600 }}>
                    <RotateCcw className="w-3.5 h-3.5" /> Re-do
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const reason = (window.prompt("Rejection reason:", result?.flags[0] ?? "Did not match citizen submission") || "Rejected by employee").trim();
                        addEntry({
                          orderId: order.id,
                          citizenName: order.citizenName,
                          type: order.expectedType,
                          qty: result?.detectedQty ?? 0,
                          matchScore: result?.matchScore ?? 0,
                          result: "rejected",
                          points: 0,
                          reason,
                          reviewedBy: user?.name ?? "Employee",
                        });
                        onResolve(order.id, "rejected");
                        toast.error(`${order.id} rejected`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => {
                        addEntry({
                          orderId: order.id,
                          citizenName: order.citizenName,
                          type: order.expectedType,
                          qty: result?.detectedQty ?? order.expectedQty,
                          matchScore: result?.matchScore ?? 0,
                          result: "verified",
                          points: order.pointsToAward,
                          reviewedBy: user?.name ?? "Employee",
                        });
                        onResolve(order.id, "verified");
                        toast.success(`${order.id} verified · +${order.pointsToAward} pts`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <CheckCircle className="w-4 h-4" /> Verify & Award {order.pointsToAward} pts
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center text-sm" style={{ fontWeight: 600 }}>
                  {resolution === "verified"
                    ? <span className="text-emerald-600 dark:text-emerald-400">✓ This order was verified.</span>
                    : <span className="text-rose-600 dark:text-rose-400">✕ This order was rejected.</span>}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
function computeResult(order: IncomingOrder, employeeCount: number): AiResult {
  // Mock AI: similarity grows with how well the employee's photo count covers
  // the citizen's, with a little jitter. Detected qty is near the expected.
  const coverage = Math.min(1, employeeCount / Math.max(1, order.citizenPhotos.length));
  const jitter = (Math.random() - 0.5) * 12;
  const matchScore = Math.max(35, Math.min(99, Math.round(62 + coverage * 34 + jitter)));
  const detectedQty = Math.max(0, order.expectedQty + Math.round((Math.random() - 0.4) * 2));
  const detectedWeightKg = Math.round((detectedQty * (order.expectedWeightKg / order.expectedQty)) * 100) / 100;

  const flags: string[] = [];
  if (matchScore < 70) flags.push("Low visual similarity to citizen photos");
  if (detectedQty < order.expectedQty) flags.push(`Detected ${detectedQty} bottles, expected ${order.expectedQty}`);
  if (employeeCount < order.citizenPhotos.length) flags.push("Fewer photos than the citizen submitted");

  const recommend = matchScore >= 85 && flags.length === 0 ? "approve" : matchScore >= 65 ? "review" : "reject";
  return { matchScore, detectedQty, detectedWeightKg, flags, recommend };
}

function ResultView({ order, result, employeePhotos }: { order: IncomingOrder; result: AiResult; employeePhotos: string[] }) {
  const scoreColor =
    result.matchScore >= 85 ? "text-emerald-600 dark:text-emerald-400"
    : result.matchScore >= 65 ? "text-amber-600 dark:text-amber-400"
    : "text-rose-600 dark:text-rose-400";

  const recBadge = {
    approve: { txt: "AI suggests: APPROVE", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
    review:  { txt: "AI suggests: MANUAL REVIEW", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
    reject:  { txt: "AI suggests: REJECT", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-300" },
  }[result.recommend];

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-white/10" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              className={scoreColor}
              strokeDasharray={`${(result.matchScore / 100) * 97.4} 97.4`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl ${scoreColor}`} style={{ fontWeight: 700 }}>{result.matchScore}%</span>
            <span className="text-[9px] text-slate-400">match</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${recBadge.cls}`} style={{ fontWeight: 700 }}>
            <Sparkles className="w-3.5 h-3.5" /> {recBadge.txt}
          </span>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Detected" value={`${result.detectedQty} bottles`} />
            <Metric label="Est. weight" value={`${result.detectedWeightKg} kg`} />
            <Metric label="Expected" value={`${order.expectedQty}× ${order.expectedType}`} />
            <Metric label="Citizen" value={order.citizenName} />
          </div>
        </div>
      </div>

      {result.flags.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-500/5 p-3">
          <div className="text-xs text-amber-600 dark:text-amber-300 mb-1" style={{ fontWeight: 700 }}>Flags</div>
          <ul className="text-xs text-amber-700 dark:text-amber-200 list-disc list-inside space-y-0.5">
            {result.flags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5" style={{ fontWeight: 700 }}>Citizen</div>
          <PhotoGrid photos={order.citizenPhotos} small />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5" style={{ fontWeight: 700 }}>Employee</div>
          <PhotoGrid photos={employeePhotos} small />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string; icon: typeof QrCode }[] = [
    { id: "scan", label: "Scan QR", icon: QrCode },
    { id: "capture", label: "Photograph", icon: Camera },
    { id: "analyze", label: "AI Compare", icon: Cpu },
    { id: "result", label: "Decision", icon: CheckCircle },
  ];
  const order: Step[] = ["scan", "capture", "analyze", "result"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                current ? "bg-emerald-600 text-white"
                : done ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                : "bg-slate-200 dark:bg-white/10 text-slate-400"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] ${current ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400"}`} style={{ fontWeight: 600 }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < idx ? "bg-emerald-400" : "bg-slate-200 dark:bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PhotoGrid({ photos, emptyLabel, small }: { photos: string[]; emptyLabel?: string; small?: boolean }) {
  if (photos.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-xs text-slate-400 ${small ? "h-20" : "h-40"}`}>
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((src, i) => (
        <div key={i} className={`rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 ${small ? "h-16" : "h-24"}`}>
          <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400" style={{ fontWeight: 700 }}>{label}</div>
      <div className="text-slate-800 dark:text-slate-100" style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: "amber" | "emerald" | "rose" }) {
  const cls = {
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  }[accent];
  return (
    <div className={`px-4 py-2 rounded-2xl ${cls}`}>
      <div className="text-xl" style={{ fontWeight: 700 }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide opacity-80" style={{ fontWeight: 600 }}>{label}</div>
    </div>
  );
}
