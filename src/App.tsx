import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Building,
  IndianRupee,
  Sparkles,
  BrainCircuit,
  Play,
  FileText,
} from 'lucide-react';

export default function App() {
  const [merchants, setMerchants] = useState<string[]>([
    'merchant_001',
    'merchant_002',
    'merchant_003',
  ]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://unredacted-marita-uncheating.ngrok-free.dev';

  // 1. Fetch Merchants on Load
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await axios.get(API_BASE + '/merchants');
        if (response.data.merchant_ids.length > 0)
          setMerchants(response.data.merchant_ids);
      } catch (err) {
        setError('AI Engine Link Offline. Verify Ngrok Status.');
      }
    };
    fetchMerchants();
  }, []);

  // 2. The "Batch Process" Logic (Runs sequentially to protect API limits)
  const runBatchAnalysis = async () => {
    setIsProcessing(true);
    setError(null);

    for (const id of merchants) {
      // Skip if already analyzed
      if (results[id]) continue;

      setActiveId(id); // Highlights the current row

      try {
        const resp = await axios.post(`${API_BASE}/underwrite/${id}`);
        // Save the result into our dictionary
        setResults((prev) => ({
          ...prev,
          [id]: { ...resp.data, merchant_id: id },
        }));
      } catch (err) {
        setResults((prev) => ({
          ...prev,
          [id]: { error: true, merchant_id: id },
        }));
      }
    }

    setActiveId(null);
    setIsProcessing(false);
  };

  const openReport = (id: string) => {
    setSelectedOffer(results[id]);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans overflow-x-hidden selection:bg-blue-500/30">
      {/* MESH GRADIENT BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-12 py-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <BrainCircuit size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                GrabCredit <span className="text-blue-500">AI</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Automated Merchant Underwriting Pipeline
            </p>
          </div>

          {/* THE MASTER BUTTON */}
          <button
            onClick={runBatchAnalysis}
            disabled={isProcessing || merchants.every((id) => results[id])}
            className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Processing
                Batch...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Analyze All Data
              </>
            )}
          </button>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3 mb-8">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* HIGH-END DATA TABLE */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.03] border-b border-white/10">
              <tr>
                <th className="py-5 px-6 font-black text-slate-500 uppercase text-xs tracking-widest">
                  Merchant ID
                </th>
                <th className="py-5 px-6 font-black text-slate-500 uppercase text-xs tracking-widest">
                  Analysis Status
                </th>
                <th className="py-5 px-6 font-black text-slate-500 uppercase text-xs tracking-widest">
                  Credit Limit
                </th>
                <th className="py-5 px-6 font-black text-slate-500 uppercase text-xs tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((id) => {
                const result = results[id];
                const isActive = activeId === id;

                return (
                  <tr
                    key={id}
                    className={`border-b border-white/5 transition-colors ${
                      isActive ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* ID Column */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <Building
                          size={16}
                          className={
                            isActive
                              ? 'text-blue-400 animate-pulse'
                              : 'text-slate-600'
                          }
                        />
                        <span className="font-bold text-slate-200">{id}</span>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-5 px-6">
                      {isActive ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs font-bold uppercase tracking-widest">
                          <Loader2 size={12} className="animate-spin" />{' '}
                          Analyzing...
                        </span>
                      ) : result ? (
                        result.error ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-bold uppercase tracking-widest">
                            <XCircle size={12} /> Failed
                          </span>
                        ) : result.decision === 'Approve' ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-xs font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-md text-xs font-bold uppercase tracking-widest">
                            <AlertCircle size={12} /> Rejected
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-bold uppercase tracking-widest">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Credit Limit Column */}
                    <td className="py-5 px-6">
                      {result &&
                      !result.error &&
                      result.decision === 'Approve' ? (
                        <div className="font-bold text-white flex items-center">
                          <IndianRupee
                            size={14}
                            className="text-slate-500 mr-1"
                          />
                          {result.credit_limit_inr.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-slate-600 font-medium">---</span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => openReport(id)}
                        disabled={!result || result.error}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-widest transition-all"
                      >
                        <FileText size={14} /> View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESULT MODAL (Same High-End Modal as before) */}
      <AnimatePresence>
        {isDialogOpen && selectedOffer && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-lg"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-2xl max-w-2xl w-full p-10 relative z-10 overflow-hidden"
            >
              <div
                className={`absolute -top-32 -right-32 w-64 h-64 blur-[100px] rounded-full transition-colors ${
                  selectedOffer.decision.toLowerCase() === 'approve'
                    ? 'bg-green-500/20'
                    : 'bg-red-500/20'
                }`}
              />
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      selectedOffer.decision.toLowerCase() === 'approve'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {selectedOffer.decision.toLowerCase() === 'approve' ? (
                      <CheckCircle2 size={32} />
                    ) : (
                      <XCircle size={32} />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                      AI Audit Result
                    </div>
                    <h4 className="text-4xl font-black tracking-tighter">
                      {selectedOffer.decision === 'Approve'
                        ? 'Approved'
                        : 'Rejected'}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem]">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                    Credit Limit
                  </p>
                  <div className="text-4xl font-black text-white flex items-center tracking-tighter">
                    <IndianRupee className="text-blue-500 mr-1" size={24} />
                    {selectedOffer.credit_limit_inr
                      ? selectedOffer.credit_limit_inr.toLocaleString()
                      : '0'}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                    Risk Rating
                  </p>
                  <div className="text-xl font-bold text-slate-200">
                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20">
                      {selectedOffer.interest_rate_tier}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] relative mb-8">
                <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest mb-4">
                  Gemini Rationale Engine
                </p>
                <p className="text-lg text-slate-300 font-medium leading-relaxed italic">
                  "{selectedOffer.rationale}"
                </p>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Close Terminal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
