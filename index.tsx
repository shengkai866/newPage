import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * PANKBASE DESIGN SYSTEM - Vertical Timeline Sidebar
 * [ Global Sidebar: Minimalist Timeline ] | [ Main Scroll: 2-Column Insight ]
 */

// --- Types ---

interface TurnData {
  id: string;
  query: string;
  aiOverview: {
    gene: string;
    qtl: string;
    relation: string;
  };
  citations: Array<{
    id: number;
    title: string;
    authors: string;
    journal: string;
    pmid: string;
  }>;
  followUpQuestions: string[];
}

// --- Constants & Schemas ---

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    aiOverview: {
      type: Type.OBJECT,
      properties: {
        gene: { type: Type.STRING },
        qtl: { type: Type.STRING },
        relation: { type: Type.STRING },
      },
      required: ["gene", "qtl", "relation"],
    },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          authors: { type: Type.STRING },
          journal: { type: Type.STRING },
          pmid: { type: Type.STRING },
        },
        required: ["id", "title", "authors", "journal", "pmid"],
      },
    },
    followUpQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
  },
  required: ["aiOverview", "citations", "followUpQuestions"],
};

// --- Mock Data ---

const INITIAL_TURN: TurnData = {
  id: 'turn-1',
  query: 'How does the SNP rs2402203 influence the expression of CFTR in Pancreas tissue, as reported by GTEx?',
  aiOverview: {
    gene: "The gene CFTR (ENSG0000001626) encodes the cystic fibrosis transmembrane conductance regulator protein, which plays a crucial role in ion transport and is implicated in immune regulation. It is associated with type 1 diabetes (MONDO_0005147), indicating its potential role in autoimmune processes.",
    qtl: "The SNP rs2402203 is associated with the gene CFTR (ENSG0000001626) in the pancreas. The effect allele is C, with a slope of -2.36, indicating a negative association with gene expression. The nominal p-value is extremely low (4.84 x 10^-17), indicating high statistical significance.",
    relation: "The gene CFTR (ENSG0000001626) is associated with Type 1 diabetes (MONDO_0005147) as an effector gene, indicating its potential role in the disease's pathogenesis. Evidence includes the identification of genetic variants like SNP rs2402203."
  },
  citations: [
    { id: 1, title: "Fine-mapping, trans-ancestral and genomic analyses identify causal variants...", authors: "Robertson CC, ..., Rich SS", journal: "NATURE GENETICS. 2021", pmid: "34127860" },
    { id: 2, title: "Interpreting type 1 diabetes risk with genetics and single-cell epigenomics.", authors: "Chiou J, ..., Gaulton KJ", journal: "NATURE. 2021", pmid: "34012112" },
    { id: 3, title: "Genome-wide association study of pancreatic gene expression.", authors: "Smith A, ..., Doe J", journal: "DIABETES. 2022", pmid: "35012345" },
    { id: 4, title: "Integrative analysis of eQTLs in human pancreas tissues.", authors: "Lee K, ..., Wang X", journal: "CELL REPORTS. 2023", pmid: "36098765" },
    { id: 5, title: "Proteogenomic characterization of cystic fibrosis proteins.", authors: "Miller R, ..., Chen L", journal: "GENOME BIOLOGY. 2023", pmid: "37045678" }
  ],
  followUpQuestions: [
    "What are the target cells for CFTR in the pancreas?",
    "Are there other SNPs in the same locus linked to T1D?",
    "How does CFTR interact with CSK in autoimmune processes?"
  ]
};

// --- Sub-Components ---

const CitationMarker: React.FC<{ num: number }> = ({ num }) => (
  <span className="inline-flex items-center justify-center w-[16px] h-[16px] border border-[#008c8c] text-[#008c8c] text-[9px] font-black rounded-full align-middle ml-1 mb-0.5 cursor-pointer transition-all duration-200 hover:bg-[#008c8c] hover:text-white">
    {num}
  </span>
);

const SectionHeader: React.FC<{ label: string; count?: number }> = ({ label, count }) => (
  <div className="flex items-center justify-between gap-3 mb-5">
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase whitespace-nowrap">{label}</span>
      {count !== undefined && (
        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black rounded-md">{count}</span>
      )}
    </div>
    <div className="h-px flex-1 bg-slate-100"></div>
  </div>
);

// --- Global Directory (Sidebar) - Minimal Timeline ---

const GlobalDirectory: React.FC<{ turns: TurnData[], onNavigate: (id: string) => void }> = ({ turns, onNavigate }) => {
  return (
    <nav className="hidden xl:flex flex-col w-[120px] fixed top-[112px] left-10 overflow-y-visible">
      {/* Timeline List (Header removed as requested) */}
      <div className="relative w-full">
        {/* Vertical Line - Centered exactly behind dots */}
        <div className="absolute right-[19px] top-1 bottom-1 w-px bg-slate-200"></div>

        <div className="flex flex-col gap-10">
          {turns.map((turn, idx) => (
            <div 
              key={turn.id} 
              onClick={() => onNavigate(turn.id)}
              className="group relative flex items-center justify-end cursor-pointer"
            >
              {/* Tooltip on Hover */}
              <div className="absolute left-full ml-6 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-[60]">
                <div className="bg-slate-900 text-white text-[12px] font-medium py-3 px-4 rounded-xl shadow-2xl min-w-[200px] max-w-[300px] border border-white/10 backdrop-blur-md">
                   {turn.query}
                   <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-slate-900"></div>
                </div>
              </div>

              {/* Label */}
              <span className="text-[16px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors mr-4 text-right">
                Q{idx + 1}
              </span>

              {/* Dot Track (Fixed Width Container to center dot and line) */}
              <div className="w-[40px] flex justify-center items-center shrink-0 relative z-10">
                <div className="w-[10px] h-[10px] bg-slate-400 rounded-full border-[2px] border-white group-hover:bg-[#008c8c] group-hover:scale-150 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

// --- Content Components ---

const AIOverviewContent: React.FC<{ data: TurnData['aiOverview'] }> = ({ data }) => (
  <div className="space-y-8">
    <SectionHeader label="AI Overview" />
    <div className="space-y-6">
      <div className="group">
        <h4 className="text-[#008c8c] text-[10px] font-black tracking-widest uppercase mb-2">Gene Function:</h4>
        <p className="text-slate-600 leading-relaxed text-[15.5px] font-medium transition-colors group-hover:text-slate-900">
          {data.gene} <CitationMarker num={1} />
        </p>
      </div>
      <div className="group">
        <h4 className="text-[#008c8c] text-[10px] font-black tracking-widest uppercase mb-2">QTL Link:</h4>
        <p className="text-slate-600 leading-relaxed text-[15.5px] font-medium transition-colors group-hover:text-slate-900">
          {data.qtl} <CitationMarker num={1} /> <CitationMarker num={3} />
        </p>
      </div>
      <div className="group">
        <h4 className="text-[#008c8c] text-[10px] font-black tracking-widest uppercase mb-2">T1D Pathogenesis:</h4>
        <p className="text-slate-600 leading-relaxed text-[15.5px] font-medium transition-colors group-hover:text-slate-900">
          {data.relation} <CitationMarker num={2} /> <CitationMarker num={4} /> <CitationMarker num={5} />
        </p>
      </div>
    </div>
  </div>
);

const VisualContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Knowledge Graph");
  const tabs = ["Knowledge Graph", "Empirical Evidence"];

  return (
    <div className="space-y-4">
      <SectionHeader label="VISUAL MATERIAL" />
      <div className="flex justify-start gap-8 border-b border-slate-200 mb-4 px-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center pb-3 text-[10px] font-medium transition-all relative text-center whitespace-nowrap ${
              activeTab === tab 
                ? 'text-[#008c8c]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#008c8c] z-10"></div>
            )}
          </button>
        ))}
      </div>
      <div className="w-full aspect-[16/11] bg-[#f2f7f9] rounded-[24px] border border-slate-100/50 flex items-center justify-center relative overflow-hidden group">
        {activeTab === "Knowledge Graph" ? (
          <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Center Circle Icon */}
              <div className="w-8 h-8 rounded-full border border-[#d1dee2] flex items-center justify-center">
                  <div className="w-px h-10 bg-[#d1dee2] absolute rotate-45"></div>
              </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-50">
             <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chart View</span>
          </div>
        )}
      </div>
    </div>
  );
};

const EvidenceList: React.FC<{ citations: TurnData['citations'] }> = ({ citations }) => {
  const [activeTab, setActiveTab] = useState("References");
  
  const tabs = ["References", "Empirical Evidence", "PanKbase Links", "External Links"];

  const mockEmpirical = [
    { id: 'E1', title: 'GTEx V8 Expression Analysis', detail: 'Significant eQTL detected in Pancreas tissue', metric: 'P-Val: 4.84e-17' },
    { id: 'E2', title: 'ATAC-Seq Chromatin Accessibility', detail: 'High accessibility score in Islet cells at locus', metric: 'Score: 0.92' }
  ];

  const mockInternal = [
    { id: 'I1', title: 'CFTR Gene Entity', detail: 'View full gene card and associated pathways', type: 'GENE' },
    { id: 'I2', title: 'rs2402203 Variant', detail: 'Explore population frequency and phenotype associations', type: 'SNP' }
  ];

  const mockExternal = [
    { id: 'X1', title: 'dbSNP Entry: rs2402203', detail: 'National Center for Biotechnology Information', source: 'NCBI' },
    { id: 'X2', title: 'Ensembl Browser: CFTR', detail: 'Transcript and sequence data', source: 'Ensembl' },
    { id: 'X3', title: 'Open Targets Genetics', detail: 'Locus-to-gene assignment evidence', source: 'Open Targets' }
  ];

  const getCount = () => {
    switch(activeTab) {
      case "References": return citations.length;
      case "Empirical Evidence": return mockEmpirical.length;
      case "PanKbase Links": return mockInternal.length;
      case "External Links": return mockExternal.length;
      default: return 0;
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader label="EVIDENCES" />
      
      {/* Tabs */}
      <div className="flex justify-between border-b border-slate-200 mb-4 px-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center pb-3 text-[10px] font-medium transition-all relative text-center leading-3 max-w-[60px] ${
              activeTab === tab 
                ? 'text-[#008c8c]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#008c8c] z-10"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-3 custom-scrollbar">
        
        {activeTab === "References" && citations.map(c => (
          <div key={c.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#008c8c]/30 hover:shadow-md transition-all group/cit">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full border border-[#008c8c] text-[#008c8c] text-[10px] font-black flex items-center justify-center shrink-0 transition-all group-hover/cit:bg-[#008c8c] group-hover/cit:text-white">
                {c.id}
              </div>
              <div className="min-w-0">
                <h5 className="text-[#008c8c] font-bold text-[11px] leading-tight line-clamp-2 group-hover/cit:underline underline-offset-4 decoration-[#008c8c]/30">
                  {c.title}
                </h5>
                <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 truncate">{c.journal} • PMID {c.pmid}</p>
              </div>
            </div>
          </div>
        ))}

        {activeTab === "Empirical Evidence" && mockEmpirical.map(item => (
           <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#008c8c]/30 hover:shadow-md transition-all group/emp">
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-lg bg-[#008c8c]/10 text-[#008c8c] text-[12px] font-black flex items-center justify-center shrink-0">
                 E
               </div>
               <div className="min-w-0 flex-1">
                 <h5 className="text-slate-700 font-bold text-[11px] leading-tight">{item.title}</h5>
                 <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{item.detail}</p>
                 <span className="inline-block mt-2 px-2 py-0.5 bg-[#008c8c]/10 text-[#008c8c] text-[10px] font-bold rounded-md">{item.metric}</span>
               </div>
             </div>
           </div>
        ))}

        {activeTab === "PanKbase Links" && mockInternal.map(item => (
           <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#008c8c]/30 hover:shadow-md transition-all cursor-pointer group">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#008c8c]/10 flex items-center justify-center text-[#008c8c] font-black text-[11px]">PK</div>
                 <div>
                   <h5 className="text-slate-800 font-bold text-[11px] group-hover:text-[#008c8c] transition-colors">{item.title}</h5>
                   <p className="text-slate-400 text-[11px] font-bold tracking-wide uppercase mt-0.5">{item.type}</p>
                 </div>
               </div>
               <svg className="w-5 h-5 text-slate-300 group-hover:text-[#008c8c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </div>
           </div>
        ))}

        {activeTab === "External Links" && mockExternal.map(item => (
           <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#008c8c]/30 hover:shadow-md transition-all cursor-pointer group">
             <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 text-slate-400 group-hover:text-[#008c8c] group-hover:border-[#008c8c]/30 transition-all flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
                <div className="min-w-0">
                  <h5 className="text-slate-700 font-bold text-[11px] leading-tight group-hover:text-[#008c8c] transition-colors">{item.title}</h5>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">{item.source}</p>
                </div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

const Header: React.FC = () => (
  <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50">
    <div className="max-w-[1920px] mx-auto px-10 h-[72px] flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#008c8c] rounded-[14px] flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black text-2xl">P</div>
        <div className="hidden sm:block">
           <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">PanKbase</h1>
           <span className="text-[10px] text-[#008c8c]/50 font-black tracking-[0.2em] uppercase mt-1 block">Genome Engine</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-black text-slate-500">
          <a href="#" className="hover:text-[#008c8c] transition-colors">Explorer</a>
          <a href="#" className="hover:text-[#008c8c] transition-colors">Datasets</a>
        </nav>
        <button className="px-6 py-2.5 bg-[#008c8c] text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-teal-700 transition-all">PanKGraph</button>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [turns, setTurns] = useState<TurnData[]>([INITIAL_TURN]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRefs = useRef<{ [id: string]: HTMLElement | null }>({});

  const showSidebar = turns.length > 1;

  const handleAsk = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setInputValue('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: query,
        config: {
          systemInstruction: "Expert bioinformatician for PanKbase. Provide structured analysis for genome queries.",
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      
      const result = JSON.parse(text);
      const turnId = `turn-${Date.now()}`;
      
      setTurns(prev => [...prev, {
        id: turnId,
        query: query,
        aiOverview: result.aiOverview,
        citations: result.citations || [],
        followUpQuestions: result.followUpQuestions || []
      }]);
      setTimeout(() => navigateTo(turnId), 100);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (id: string) => {
    const el = scrollRefs.current[id];
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-48">
      <Header />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      <div className="max-w-[1920px] mx-auto px-10 pt-[104px] flex">
        
        {/* Timeline Sidebar */}
        {showSidebar && <GlobalDirectory turns={turns} onNavigate={navigateTo} />}

        {/* Main Content Area - Compensate for sidebar width */}
        <div className={`flex-1 flex flex-col gap-14 ${showSidebar ? 'xl:ml-[160px]' : ''}`}>
          {turns.map((turn, idx) => (
            <article 
              key={turn.id} 
              ref={el => { scrollRefs.current[turn.id] = el; }}
              className="bg-white rounded-[40px] border border-slate-200/50 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:shadow-slate-200/20"
            >
              
              {/* Horizontal Question Header */}
              <section className="w-full px-12 py-12 bg-slate-50/40 border-b border-slate-100">
                <div className="flex items-start gap-8">
                  <div className="mt-1.5 bg-[#008c8c] text-white text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shrink-0 shadow-lg shadow-teal-500/20">
                    Q{idx + 1}
                  </div>
                  <h2 className="text-[34px] font-black text-slate-800 leading-[1.2] tracking-tight">
                    {turn.query}
                  </h2>
                </div>
              </section>

              {/* 2-Column Insight Content */}
              <div className="flex flex-col lg:flex-row min-h-[500px]">
                <div className="flex-1 p-12 lg:border-r border-slate-50">
                  <AIOverviewContent data={turn.aiOverview} />
                  <div className="mt-14 pt-10 border-t border-slate-50">
                    <SectionHeader label="Follow up" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {turn.followUpQuestions.map((q, i) => (
                        <button key={i} onClick={() => handleAsk(q)} className="text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-[#008c8c]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all group flex items-center justify-between">
                          <span className="text-slate-600 text-[13px] font-bold group-hover:text-[#008c8c] line-clamp-1">{q}</span>
                          <svg className="w-4 h-4 text-[#008c8c] opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[40%] p-12 bg-white flex flex-col gap-12 border-t lg:border-t-0">
                  <VisualContent />
                  <EvidenceList citations={turn.citations} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="fixed bottom-12 left-0 right-0 z-50 flex justify-center px-10 pointer-events-none">
        <div className="max-w-[800px] w-full pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-3xl rounded-[32px] border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] p-3 flex items-center gap-5 pl-8 pr-3 h-20 ring-1 ring-slate-900/5 focus-within:ring-[#008c8c]/30">
            <input 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk(inputValue)}
              placeholder="Ask for genomic insights..." 
              className="flex-1 bg-transparent border-none outline-none text-[17px] font-normal text-slate-700 placeholder-slate-400"
            />
            <button 
              onClick={() => handleAsk(inputValue)}
              disabled={isLoading}
              className={`h-14 px-10 bg-[#008c8c] text-white rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 flex items-center gap-3 ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) ReactDOM.createRoot(rootElement).render(<App />);