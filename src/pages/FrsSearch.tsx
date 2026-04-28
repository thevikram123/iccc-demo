import { img } from '../utils/imagePath';
import React, { useState, useEffect } from 'react';
import { useAuditLog } from '../context/AuditLogContext';

export default function FrsSearch() {
  const { addLog } = useAuditLog();
  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cctvSearchComplete, setCctvSearchComplete] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const steps = [
    { id: 1, label: 'INTAKE' },
    { id: 2, label: 'FUSION QUERY' },
    { id: 3, label: 'ENTITY RESOLUTION' },
    { id: 4, label: 'DE-DUPLICATION' },
    { id: 5, label: 'PUBLISH TO FRS' },
    { id: 6, label: 'CCTV SEARCH' },
    { id: 7, label: 'DETECTION' },
    { id: 8, label: 'CORRELATION' },
    { id: 9, label: 'ANALYTICS' }
  ];

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
      addLog('NAVIGATE', `Proceeded to ${steps[currentStep].label}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      addLog('NAVIGATE', `Returned to ${steps[currentStep - 2].label}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface-dim overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-black/10 flex justify-between items-end bg-white">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">IDENTITY INTELLIGENCE & TRACKING</h1>
          <p className="font-mono text-xs text-black mt-1 tracking-widest">MULTI-SOURCE FUSION & FRS</p>
        </div>
      </div>

      {/* Step Wizard Bar */}
      <div className="flex border-b border-black/10 bg-surface-container-low px-6">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar relative py-4">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center justify-center gap-2 min-w-[120px] 
                    ${isActive ? '' : 'opacity-60'} transition-opacity cursor-pointer`}
                  onClick={() => {
                     if (isCompleted || isUpcoming) {
                       // Optional: only allow jumping if completed
                       if (isCompleted) setCurrentStep(step.id);
                     }
                  }}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full font-mono text-[10px] font-bold border-2
                    ${isCompleted ? 'bg-black border-black text-white' : 
                      isActive ? 'bg-primary-fixed border-black text-black' : 
                      'bg-transparent border-black/30 text-black'}
                  `}>
                    {isCompleted ? <span className="material-symbols-outlined text-[14px]">check</span> : step.id}
                  </div>
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-widest whitespace-nowrap
                    ${isActive ? 'text-black' : isCompleted ? 'text-black' : 'text-black'}
                  `}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-px shrink-0 mt-3 ${isCompleted ? 'bg-black' : 'bg-black/20'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main App Area */}
      <div className="flex-1 overflow-hidden flex bg-surface-container-lowest">
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col relative">
          
          <div className="flex-1 flex flex-col mb-20 max-w-5xl mx-auto w-full">
            {currentStep === 1 && <StepIntake />}
            {currentStep === 2 && <StepFusionQuery />}
            {currentStep === 3 && <StepEntityResolution />}
            {currentStep === 4 && <StepDeduplication />}
            {currentStep === 5 && <StepPublishFRS />}
            {currentStep === 6 && <StepCctvSearch onComplete={() => setCctvSearchComplete(true)} />}
            {currentStep === 7 && <StepDetection />}
            {currentStep === 8 && <StepCorrelation />}
            {currentStep === 9 && <StepAnalytics />}
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-[68px] right-[320px] bg-white border-t border-black/10 p-4 flex justify-between items-center z-10 
            w-[calc(100%-320px-68px)]">
            <button 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-black/20 text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span> BACK
            </button>
            
            {currentStep < 9 && (
               <button 
                onClick={handleNext}
                disabled={currentStep === 6 && !cctvSearchComplete}
                className="px-8 py-3 bg-primary-fixed border border-black text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getNextLabel(currentStep)} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            )}

            {currentStep === 9 && (
              <div className="flex gap-4">
                 <button 
                    onClick={() => addLog('EVIDENCE_ACTION', 'Downloaded analytical intelligence packet')}
                    className="px-6 py-3 border border-black text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2 relative group"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_zip</span> DOWNLOAD EVIDENCE ZIP
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      Contains: Video snippets, Timeline PDF, Risk Matrix
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                       addLog('EVIDENCE_ACTION', 'Shared evidence packet with assigned agencies');
                       setShowEvidenceModal(true);
                    }}
                    className="px-6 py-3 border border-black text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2 relative group bg-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span> SHARE EVIDENCE
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      Recipients: ATB, Special Cell, CID
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                       setShowDispatchModal(true);
                    }}
                    className="px-6 py-3 bg-error border border-error text-white font-mono text-xs font-bold tracking-widest uppercase hover:bg-black hover:border-black transition-colors flex items-center gap-2 relative group"
                  >
                    <span className="material-symbols-outlined text-[16px]">local_police</span> DISPATCH PATROL UNIT
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-error text-white font-bold px-3 py-1 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      Target: New Delhi Railway Stn - Platform 3 (last seen 5m ago)
                    </div>
                  </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className={`shrink-0 border-l border-black/10 bg-surface-container flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-12'}`}>
          <div className="p-4 border-b border-black/10 flex justify-between items-center cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
             {sidebarOpen && <h3 className="font-mono text-xs text-black uppercase font-bold tracking-widest">SUBJECT PROFILE</h3>}
             <span className="material-symbols-outlined text-black hover:text-black">
                {sidebarOpen ? 'chevron_right' : 'chevron_left'}
             </span>
          </div>

          {sidebarOpen && (
             <div className="flex-1 p-6 flex flex-col">
                <div className="bg-surface-container-highest border border-black/10 p-5 flex flex-col gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-black/5 border border-black/10 flex items-center justify-center shrink-0">
                       {currentStep > 3 ? (
                          <img src={img("/images/Raju 1.jpeg")} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                          <span className="material-symbols-outlined text-3xl text-black">person</span>
                       )}
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg leading-tight uppercase relative">
                         {currentStep > 3 ? 'Richard Fernandes' : 'Raju'}
                      </h4>
                      <div className="mt-1">
                        {currentStep >= 5 ?(
                          <span className="font-mono text-[9px] bg-[#ffe600] text-black px-1.5 py-0.5 border border-black uppercase font-bold inline-flex items-center gap-1">
                             <span className="material-symbols-outlined text-[10px]">verified</span> Canonical
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] bg-surface-container-highest text-black px-1.5 py-0.5 border border-black/30 uppercase font-bold">Identity unverified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                     <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Aliases:</div>
                     <div className="flex flex-wrap gap-1">
                        <span className="font-mono text-[10px] bg-surface-container text-black border border-black/10 px-1.5 py-0.5">Raju</span>
                        {currentStep > 3 && <span className="font-mono text-[10px] bg-surface-container text-black border border-black/10 px-1.5 py-0.5">Ricky F</span>}
                     </div>
                  </div>

                  {currentStep > 4 && (
                     <div className="mt-auto border-t border-black/10 pt-4 flex justify-between items-center">
                       <span className="font-mono text-[10px] text-black uppercase tracking-widest">Identity Confidence</span>
                       <span className="font-mono text-lg font-bold text-black border-b-[3px] border-primary-fixed">86%</span>
                     </div>
                  )}
               </div>
             </div>
          )}
        </div>

      </div>

      {showEvidenceModal && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-8">
            <div className="bg-white max-w-4xl w-full flex flex-col shadow-2xl relative">
               
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-black/10">
                  <div className="flex items-center gap-3 text-black">
                     <span className="material-symbols-outlined text-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                     <h2 className="font-headline font-black text-2xl tracking-widest uppercase">Evidence Packet Preview</h2>
                  </div>
                  <button onClick={() => setShowEvidenceModal(false)} className="text-black hover:opacity-70 transition-opacity">
                     <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
               </div>

               {/* Body */}
               <div className="p-8">
                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
                     <div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-1">Case Reference</div>
                        <div className="font-mono text-sm text-black">ALT-1042</div>
                     </div>
                     <div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-1">Timestamp</div>
                        <div className="font-mono text-sm text-black">14:02:15 UTC</div>
                     </div>
                     <div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-1">Incident Type</div>
                        <div className="font-mono text-sm font-bold bg-[#ffe600] text-black inline-block px-1">TARGET_IDENTIFICATION</div>
                     </div>
                     <div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-1">Severity</div>
                        <div className="font-mono text-sm font-bold text-error border border-error inline-block px-2 py-0.5">CRITICAL</div>
                     </div>
                     <div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-1">Location</div>
                        <div className="font-mono text-sm text-black">Vasant Kunj Sector C</div>
                     </div>
                     <div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-1">Generated By</div>
                        <div className="font-mono text-sm text-black">AI_ANALYTICS_ENGINE</div>
                     </div>
                  </div>

                  <hr className="border-black/10 mb-6" />

                  {/* Attached Assets */}
                  <div className="mb-8">
                     <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-4">Attached Assets</div>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="border border-black/10 p-6 flex flex-col items-center text-center">
                           <span className="material-symbols-outlined text-black text-2xl mb-3">image</span>
                           <div className="font-mono text-xs text-black mb-2">1x High-Res Frame</div>
                           <div className="font-mono text-[10px] text-black uppercase">JPEG • 2.1 MB</div>
                        </div>
                        <div className="border border-black/10 p-6 flex flex-col items-center text-center">
                           <span className="material-symbols-outlined text-black text-2xl mb-3">movie</span>
                           <div className="font-mono text-xs text-black mb-2">1x Video Clip (±15s)</div>
                           <div className="font-mono text-[10px] text-black uppercase">MP4 • 45 MB</div>
                        </div>
                        <div className="border border-black/10 p-6 flex flex-col items-center text-center">
                           <span className="material-symbols-outlined text-black text-2xl mb-3">description</span>
                           <div className="font-mono text-xs text-black mb-2">AI Detection Metadata</div>
                           <div className="font-mono text-[10px] text-black uppercase">JSON • 8 KB</div>
                        </div>
                     </div>
                  </div>

                  <hr className="border-black/10 mb-6" />

                  {/* Recipient Agencies */}
                  <div className="mb-8">
                     <div className="font-mono text-[10px] tracking-widest uppercase text-black mb-4">Recipient Agencies</div>
                     <div className="relative">
                        <select className="w-full appearance-none bg-white border border-black/20 text-black font-mono text-xs p-4 focus:outline-none focus:border-black transition-colors cursor-pointer">
                           <option>Delhi Police - Central Command</option>
                           <option>Anti-Terror Squad (ATS)</option>
                           <option>Special Cell HQ</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">expand_more</span>
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="p-6 border-t border-black/10 flex justify-end gap-4 bg-white">
                  <button onClick={() => setShowEvidenceModal(false)} className="px-8 py-3 bg-white text-black border border-black/20 font-mono text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors">
                     Cancel
                  </button>
                  <button onClick={() => setShowEvidenceModal(false)} className="px-8 py-3 bg-[#ffe600] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-[#ffe600] transition-colors group border border-transparent hover:border-black">
                     <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">send</span> Confirm & Send
                  </button>
               </div>
            </div>
         </div>
      )}

      {showDispatchModal && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-8">
            <div className="bg-white border border-black max-w-xl w-full max-h-full flex flex-col shadow-2xl relative">
               <button onClick={() => setShowDispatchModal(false)} className="absolute top-4 right-4 text-black hover:text-black">
                  <span className="material-symbols-outlined">close</span>
               </button>
               <div className="p-6 border-b border-black/10 bg-error/10">
                  <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-error flex items-center gap-3">
                     <span className="material-symbols-outlined text-3xl">local_police</span> Dispatch Patrol Unit
                  </h2>
               </div>
               <div className="p-6 flex flex-col gap-6">
                  <div>
                     <h3 className="font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-1">Target Location</h3>
                     <div className="font-mono text-sm">New Delhi Railway Station - Platform 3</div>
                     <div className="font-mono text-[10px] text-error font-bold mt-1">Last seen: 5 minutes ago</div>
                  </div>
                  <div>
                     <label className="block font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-2">Select Unit to Dispatch</label>
                     <div className="relative">
                       <select className="w-full appearance-none bg-surface-container border border-black/20 text-black font-mono text-sm p-4 focus:outline-none focus:border-black transition-colors cursor-pointer">
                          <option>Police Station: New Delhi Rly Station (0.1km)</option>
                          <option>Patrol Team: PCR Van 42 (0.3km)</option>
                          <option>Police Station: Paharganj (0.8km)</option>
                          <option>Patrol Team: QRT Central (1.2km)</option>
                          <option>Police Station: Connaught Place (1.5km)</option>
                       </select>
                       <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">expand_more</span>
                     </div>
                  </div>
                  <div className="border border-black/10 p-4 bg-surface-container/50">
                     <label className="block font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-2">Instructions for Unit</label>
                     <textarea readOnly className="w-full bg-white border border-black/20 text-black font-mono text-xs p-3 min-h-[80px] focus:outline-none" value="Proceed to NDLS Platform 3. Target identified with 86% confidence. Name: Richard Fernandes. Aliases: Raju, Ricky F. Exercise standard apprehension protocols. Evidence packet available via terminal." />
                  </div>
                  <button onClick={() => {
                     addLog('DISPATCH_ACTION', 'Dispatched patrol unit to target area based on analytics');
                     setShowDispatchModal(false);
                  }} className="w-full py-4 bg-error text-white font-mono text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-2 border border-error hover:bg-black hover:border-black transition-colors mt-2">
                     <span className="material-symbols-outlined">radio</span> CONFIRM DISPATCH
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}

function getNextLabel(step: number) {
  switch (step) {
    case 1: return 'Run Fusion Query';
    case 2: return 'Send to Entity Resolution';
    case 3: return 'Proceed to De-duplication';
    case 4: return 'Proceed to Publish';
    case 5: return 'Start CCTV Search';
    case 6: return 'View Detections';
    case 7: return 'Run Camera Correlation';
    case 8: return 'View Analytics';
    default: return 'Next';
  }
}

// ---------------------------------------------------------
// STEP COMPONENTS STUBS
// ---------------------------------------------------------

function StepIntake() {
  return (
    <div className="w-full">
       <div className="mb-8">
         <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
           <span className="material-symbols-outlined text-3xl">person_search</span>
           Partial Identity Intake
         </h2>
         <p className="font-mono text-sm text-black mt-1">Enter known identifiers, aliases, and physical cues to begin cross-database search</p>
       </div>

       <div className="grid grid-cols-5 gap-8">
          <div className="col-span-3 flex flex-col gap-6">
             
             <div>
                <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Aliases (Known Names)</label>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                   <div className="bg-surface-container border border-black px-3 py-1 font-mono text-xs font-bold text-black flex items-center gap-2">
                     Raju
                     <span className="material-symbols-outlined text-[14px] cursor-pointer hover:opacity-70">close</span>
                   </div>
                </div>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black" placeholder="Add alien / monikers..." />
                  <button className="w-12 border border-black/20 font-bold flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                     <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Approx Age Band</label>
                  <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black appearance-none">
                     <option>35-45 years</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Gender</label>
                  <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black appearance-none">
                     <option>Male</option>
                  </select>
                </div>
             </div>

             <div className="border-t border-black/10 my-2 pt-6">
                <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-4">Physical Features</label>
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 appearance-none focus:outline-none focus:border-black">
                     <option>170-180 cm</option>
                  </select>
                  <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 appearance-none focus:outline-none focus:border-black">
                     <option>Medium Built</option>
                  </select>
                  <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 appearance-none focus:outline-none focus:border-black">
                     <option>Fair Complexion</option>
                  </select>
                  <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 appearance-none focus:outline-none focus:border-black">
                     <option>Short Black Hair</option>
                  </select>
                </div>
             </div>
             
             <div>
                <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Scars / Marks / Tattoos</label>
                <input type="text" className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black" defaultValue="Scar on left cheek" />
             </div>

             <div>
                <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Last Known Area</label>
                <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 appearance-none focus:outline-none focus:border-black">
                   <option>Vasant Kunj, New Delhi</option>
                </select>
             </div>

             <div>
                <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Associated Vehicle Cues (Optional)</label>
                <input type="text" className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black" placeholder="e.g., Red Honda Activa, partial plate GJ-01-XX" />
             </div>

          </div>

          <div className="col-span-2">
             <div className="border border-black/20 bg-white p-6 sticky top-6 hover:border-black transition-colors">
               <h3 className="font-mono text-xs text-black font-bold uppercase tracking-widest mb-6">Preview Card</h3>
               
               <div className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-container border border-black/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-4xl text-black">person</span>
                  </div>
                  <div className="flex-1">
                     <h4 className="font-headline font-black text-xl uppercase mb-1 border-b-[3px] border-primary-fixed inline-block">Raju</h4>
                     <p className="font-mono text-[10px] text-black">(alias)</p>
                     
                     <div className="mt-4 space-y-1">
                        <p className="font-mono text-[10px] text-black"><span className="font-bold">Age:</span> 35-45 years</p>
                        <p className="font-mono text-[10px] text-black flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span> Vasant Kunj, New Delhi
                        </p>
                     </div>
                  </div>
               </div>

               <div className="mt-6 pt-4 border-t border-black/10">
                  <p className="font-mono text-xs text-black"><span className="font-bold">Marks:</span> Scar on left cheek</p>
               </div>

               <div className="mt-8">
                 <div className="border-2 border-dashed border-black/20 bg-surface-container flex flex-col items-center justify-center py-10 cursor-pointer hover:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined text-4xl text-black mb-2">upload</span>
                    <p className="font-mono text-[10px] text-black font-bold uppercase tracking-widest text-center px-4">Upload Reference Photo<br/><span className="text-black lowercase mt-1 inline-block">(optional)</span></p>
                    <button className="mt-4 px-4 py-1 border border-black font-mono text-[10px] bg-white uppercase font-bold">Select File</button>
                 </div>
               </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function StepFusionQuery() {
  const dbs = [
    { name: 'CCTNS', hits: 1, best: 68 },
    { name: 'ICJS', hits: 1, best: 88 },
    { name: 'VAHAN', hits: 1, best: 64 },
    { name: 'SARATHI', hits: 2, best: 74 },
    { name: 'ZIPNET', hits: 0, best: 0 },
    { name: 'TrackChild', hits: 0, best: 0 }
  ];

  const pool = [
    { name: 'Richard Fernandes', alias: 'Raju, Ricky F', loc: 'Vasant Kunj', dbs: ['CCTNS', 'VAHAN'], match: 86 },
    { name: 'Rajesh Kumar', alias: 'Raju', loc: 'Hauz Khas', dbs: ['SARATHI'], match: 72 },
    { name: 'R. Fernandez', alias: 'Richard', loc: 'Vasant Kunj South', dbs: ['CCTNS', 'ICJS'], match: 84 },
    { name: 'Rajendra Singh', alias: 'Raju', loc: 'Civil Lines', dbs: ['CCTNS'], match: 65 },
    { name: 'Richard F.', alias: 'Ricky, Raju', loc: 'Vasant Kunj', dbs: ['VAHAN', 'SARATHI'], match: 81 },
    { name: 'Ravi Kumar', alias: 'Raju K', loc: 'Karol Bagh', dbs: ['ICJS'], match: 58 },
  ];

  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const toggleSelect = (i: number) => {
     if (selectedCandidates.includes(i)) {
        setSelectedCandidates(selectedCandidates.filter(idx => idx !== i));
     } else {
        setSelectedCandidates([...selectedCandidates, i]);
     }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
       <div className="mb-8">
         <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
           <span className="material-symbols-outlined text-3xl bg-primary-fixed text-black border border-black p-1 rounded-sm">database</span>
           Multi-Database Fusion Query
         </h2>
         <p className="font-mono text-sm text-black mt-1">Searching across law enforcement databases using partial cues</p>
       </div>

       {/* Database Status Cards */}
       <div className="grid grid-cols-3 gap-6 mb-10">
          {dbs.map(db => (
            <div key={db.name} className="border border-black/10 bg-white p-6 flex flex-col justify-between hover:border-black/30 transition-colors">
               <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined bg-primary-fixed text-black px-1 border border-black text-2xl">{db.name === 'CCTNS' ? 'local_police' : db.name === 'VAHAN' ? 'directions_car' : db.name === 'SARATHI' ? 'badge' : db.name === 'ICJS' ? 'gavel' : 'database'}</span>
                   <span className="font-mono text-xs font-bold uppercase tracking-widest">{db.name}</span>
                 </div>
                 <div className={`w-3 h-3 rounded-full ${db.hits > 0 ? 'bg-green-500 animate-pulse' : 'bg-black/20'}`}></div>
               </div>
               <div className="flex justify-between items-end border-t border-black/10 pt-4">
                 <div>
                   <div className="font-mono text-[10px] text-black uppercase tracking-widest">Hits Found</div>
                   <div className="font-mono text-xl font-bold">{db.hits}</div>
                 </div>
                 <div className="text-right">
                   <div className="font-mono text-[10px] text-black uppercase tracking-widest">Best Match</div>
                   <div className="font-mono text-xl font-bold bg-primary-fixed text-black px-1 border border-black">{db.best}%</div>
                 </div>
               </div>
            </div>
          ))}
       </div>

       {/* Candidate Pool */}
       <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-4 border-b border-black/20 pb-2">
            <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest">Candidate Pool (6)</h3>
            <span className="font-mono text-xs bg-black text-white px-3 py-1 font-bold">{selectedCandidates.length} selected</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {pool.map((c, i) => {
                const isSelected = selectedCandidates.includes(i);
                return (
                  <div key={i} 
                    onClick={() => toggleSelect(i)}
                    className={`bg-white border p-5 transition-colors cursor-pointer flex justify-between group relative overflow-hidden
                       ${isSelected ? 'border-primary-fixed shadow-md' : 'border-black/10 hover:border-black'}
                    `}>
                     <div className={`absolute top-0 right-0 h-full w-[4px] bg-primary-fixed transform transition-transform origin-top ${isSelected ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'}`}></div>
                     <div className="flex flex-col gap-3">
                       <div>
                         <h4 className="font-headline font-bold text-lg leading-none flex items-center gap-2">
                            {isSelected && <span className="material-symbols-outlined bg-primary-fixed text-black px-1 border border-black text-[18px]">check_circle</span>}
                            {c.name}
                         </h4>
                         <div className="font-mono text-[9px] text-black mt-1">Alias: {c.alias}</div>
                       </div>
                       <div className="font-mono text-[10px] text-black flex items-center gap-1">
                         <span className="material-symbols-outlined text-[12px]">location_on</span> {c.loc}
                       </div>
                       <div className="flex flex-wrap gap-2 mt-1">
                         {c.dbs.map(db => ( <span key={db} className="font-mono text-[9px] font-bold bg-surface-container border border-black/20 px-2 py-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">{db === 'CCTNS' ? 'local_police' : db === 'VAHAN' ? 'directions_car' : db === 'SARATHI' ? 'badge' : db === 'ICJS' ? 'gavel' : 'database'}</span> {db}</span> ))}
                       </div>
                     </div>
                     <div className="flex flex-col items-end justify-center">
                        <div className="text-4xl font-black font-mono tracking-tighter">{c.match}<span className="text-xl">%</span></div>
                        <div className="font-mono text-[10px] text-black uppercase mt-1 tracking-widest">Match</div>
                     </div>
                  </div>
                )
             })}
          </div>
       </div>

    </div>
  );
}

function StepEntityResolution() {
  const [clusterAction, setClusterAction] = useState<string | null>(null);

  const clusters = [
    { id: 'CLU-A', match: 84, alias: 'Raju', count: 4, active: true },
    { id: 'CLU-B', match: 68, alias: 'Raju', count: 2, active: false },
    { id: 'CLU-C', match: 45, alias: 'Raju K', count: 1, active: false },
  ];

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6 flex justify-between items-end border-b border-black/10 pb-4">
         <div>
           <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl">hub</span>
             Entity Resolution
           </h2>
           <p className="font-mono text-sm text-black mt-1">Cross-referencing attributes to form identity clusters</p>
         </div>
       </div>
       
       <div className="flex gap-6 flex-1 overflow-hidden">
         
         {/* Left Side: Clusters List */}
         <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <h3 className="font-mono text-xs text-black uppercase font-bold tracking-widest">Identity Clusters</h3>
            
            {clusters.map(clu => (
               <div key={clu.id} className={`border p-5 cursor-pointer transition-colors relative overflow-hidden ${clu.active ? 'border-black bg-black/5' : 'border-black/10 bg-white hover:border-black/30'}`}>
                  {clu.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>}
                  <div className="flex justify-between items-start mb-3">
                     <span className="font-mono text-xs font-bold text-black">{clu.id}</span>
                     <span className="font-headline font-black text-2xl leading-none">{clu.match}%</span>
                  </div>
                  <div className="font-mono text-[12px] font-bold text-black mb-1">Top alias: {clu.alias}</div>
                  <div className="font-mono text-[10px] text-black tracking-widest uppercase">{clu.count} records linked</div>
               </div>
            ))}
         </div>

         {/* Right Side: Cluster Details */}
         <div className="flex-1 bg-white border border-black/10 p-6 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10 shrink-0">
               <h3 className="font-mono text-base font-bold tracking-widest uppercase">CLUSTER CLU-A</h3>
               <div className="bg-primary-fixed text-black font-mono text-sm font-bold px-4 py-1.5">84% CONFIDENCE</div>
            </div>

            <div className="flex flex-col flex-1 gap-6">
               <div className="border border-black/10 p-4 bg-surface-container">
                  <h4 className="font-mono text-xs uppercase font-bold text-black mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-black">analytics</span>
                    Cluster Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <h5 className="font-mono text-[10px] uppercase font-bold text-black mb-3 tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span> Agreements</h5>
                        <ul className="space-y-2 font-mono text-xs">
                           <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-600">check</span> Same alias "Raju"</li>
                           <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-600">check</span> Same locality band (Vasant Kunj)</li>
                           <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-600">check</span> Consistent DOB: 1985-03-15</li>
                           <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-600">check</span> Matching physical mark: Scar on left cheek</li>
                        </ul>
                     </div>
                     <div>
                        <h5 className="font-mono text-[10px] uppercase font-bold text-black mb-3 tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#ffba38]">warning</span> Conflicts</h5>
                        <ul className="space-y-2 font-mono text-xs">
                           <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-[#ffba38]">info</span> Address variants (Plot 23 vs Plot 25)</li>
                           <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-[#ffba38]">info</span> Name spelling conventions (Fernandes vs Fernandez)</li>
                        </ul>
                     </div>
                  </div>
               </div>

               <div className="flex-1">
                  <h4 className="font-mono text-xs uppercase font-bold text-black mb-3 tracking-widest">Linked Records (3)</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center bg-white border border-black/20 p-4 hover:border-black transition-colors">
                        <div className="flex items-center gap-3">
                           <span className="material-symbols-outlined text-black text-2xl">person</span>
                           <span className="font-mono text-sm font-bold uppercase">Richard Fernandes</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="flex gap-2">
                              <span className="font-mono text-[10px] font-bold border border-black/20 px-2 py-0.5 bg-surface-container">CCTNS</span>
                              <span className="font-mono text-[10px] font-bold border border-black/20 px-2 py-0.5 bg-surface-container">NCRB</span>
                           </div>
                           <span className="font-mono text-lg font-bold bg-primary-fixed text-black px-1 border border-black">86%</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center bg-white border border-black/20 p-4 hover:border-black transition-colors">
                        <div className="flex items-center gap-3">
                           <span className="material-symbols-outlined text-black text-2xl">person</span>
                           <span className="font-mono text-sm font-bold uppercase">R. Fernandez</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="flex gap-2">
                              <span className="font-mono text-[10px] font-bold border border-black/20 px-2 py-0.5 bg-surface-container">CCTNS</span>
                              <span className="font-mono text-[10px] font-bold border border-black/20 px-2 py-0.5 bg-surface-container">ICJS</span>
                           </div>
                           <span className="font-mono text-lg font-bold bg-primary-fixed text-black px-1 border border-black">84%</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center bg-white border border-black/20 p-4 hover:border-black transition-colors">
                        <div className="flex items-center gap-3">
                           <span className="material-symbols-outlined text-black text-2xl">person</span>
                           <span className="font-mono text-sm font-bold uppercase">Richard F.</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="flex gap-2">
                              <span className="font-mono text-[10px] font-bold border border-black/20 px-2 py-0.5 bg-surface-container">VAHAN</span>
                              <span className="font-mono text-[10px] font-bold border border-black/20 px-2 py-0.5 bg-surface-container">SARATHI</span>
                           </div>
                           <span className="font-mono text-lg font-bold bg-primary-fixed text-black px-1 border border-black">81%</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-8 border-t border-black/10 pt-6 shrink-0">
               {clusterAction === 'accepted' ? (
                  <div className="w-full py-4 bg-black text-white font-mono text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                     <span className="material-symbols-outlined bg-primary-fixed text-black px-1 border border-black">check_circle</span> Cluster Accepted
                  </div>
               ) : clusterAction === 'split' ? (
                  <div className="w-full py-4 border-2 border-black bg-white text-black font-mono text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                     <span className="material-symbols-outlined">call_split</span> Cluster Split Logged
                  </div>
               ) : (
                  <div className="flex gap-4">
                     <button 
                        onClick={() => setClusterAction('accepted')}
                        className="flex-1 py-4 bg-[#00c853] text-white font-mono text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">call_merge</span> Accept Cluster
                     </button>
                     <button 
                        onClick={() => setClusterAction('split')}
                        className="flex-1 py-4 border-2 border-[#ffba38] text-black font-mono text-sm font-bold uppercase tracking-widest hover:bg-[#ffba38] hover:text-black transition-colors flex items-center justify-center gap-2 bg-white">
                        <span className="material-symbols-outlined">call_split</span> Split Cluster
                     </button>
                  </div>
               )}
            </div>

         </div>
       </div>
    </div>
  )
}
function StepDeduplication() { 
  const [identityLocked, setIdentityLocked] = useState(false);

  return (
    <div className="w-full flex-1 flex flex-col">
       <div className="mb-6 flex justify-between items-end border-b border-black/10 pb-4">
         <div>
           <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl bg-primary-fixed text-black border border-black rounded-sm p-1">bolt</span>
             De-duplication Algorithm
           </h2>
           <p className="font-mono text-sm text-black mt-1">AI-powered identity resolution</p>
         </div>
       </div>

       <div className="flex gap-6 flex-1">
         {/* Left Side: Algorithm Status */}
         <div className="w-[450px] shrink-0 flex flex-col gap-4">
            <div className="border border-black/10 bg-white p-4 relative">
               <img src={img("/images/Raju 1.jpeg")} alt="Best Match Frame" className="w-full aspect-video object-cover object-top" />
               <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-fixed text-black font-mono text-[9px] font-bold px-2 py-1 flex flex-col items-center border border-black">
                 <span className="material-symbols-outlined text-[12px]">filter_center_focus</span>
                 CANONICAL: 86%
               </div>
               <div className="absolute bottom-4 left-4 right-4 flex justify-between font-mono text-[10px] text-white bg-black/60 px-2 py-1">
                  <span className="bg-primary-fixed text-black px-1 border border-black font-bold uppercase tracking-widest">Best Match Frame</span>
                  <span>Richard Fernandes</span>
               </div>
            </div>

            <div className="border border-green-600 bg-green-50 p-4">
               <div className="flex items-center gap-2 text-green-700 font-mono text-sm font-bold uppercase tracking-widest mb-1">
                  <span className="material-symbols-outlined">check_circle</span>
                  Algorithm Complete
               </div>
               <p className="font-mono text-[10px] text-green-800">Canonical identity selected based on highest confidence score and multi-source verification.</p>
            </div>

            <div className="mt-4">
               <h3 className="font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-3">Analyzed Candidates</h3>
               <div className="space-y-2">
                  <div className="border border-green-600 bg-green-50 p-3 flex justify-between items-center text-green-800 font-mono text-xs font-bold">
                     <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check_circle</span> Richard Fernandes</span>
                     <span>86%</span>
                  </div>
                  <div className="border border-black/10 bg-white p-3 flex justify-between items-center text-black font-mono text-xs">
                     <span>R. Fernandez</span>
                     <span>84%</span>
                  </div>
                  <div className="border border-black/10 bg-white p-3 flex justify-between items-center text-black font-mono text-xs">
                     <span>Richard F.</span>
                     <span>81%</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side: Canonical Profile */}
         <div className="flex-1 bg-white border border-black/10 p-6 flex flex-col relative">
            <div className="mb-6">
               <div className="bg-[#ffe600] text-black font-mono text-sm font-bold tracking-widest uppercase inline-block px-4 py-2 border border-black">
                  CANONICAL PROFILE
               </div>
            </div>
            
            <div className="flex gap-4 items-center mb-6">
              <div className="w-20 h-20 bg-surface-container border border-black/10 shrink-0 relative">
                 <img src={img("/images/Raju 1.jpeg")} alt="Canonical" className="w-full h-full object-cover object-top" />
                 {identityLocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                       <span className="material-symbols-outlined text-[14px]">lock</span>
                    </div>
                 )}
              </div>
              <div>
                 <h4 className="font-headline font-black text-2xl uppercase leading-none">Richard Fernandes</h4>
                 <div className="font-mono text-[10px] text-black mt-1 flex items-center gap-2">
                   Identity confidence: <span className="text-xl font-bold bg-primary-fixed text-black px-1 border border-black">86%</span>
                 </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
               <div>
                 <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-2">Known Aliases:</div>
                 <div className="flex gap-2">
                    <span className="font-mono text-[10px] bg-black text-white px-2 py-1 font-bold">Raju <span className="bg-primary-fixed text-black px-1 border border-black font-normal lowercase">(intake)</span></span>
                    <span className="font-mono text-[10px] bg-surface-container border border-black/20 text-black px-2 py-1">Ricky F</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="border border-black/10 p-3 bg-surface-container flex justify-between items-center">
                    <span className="font-mono text-[10px] text-black uppercase">DOB:</span>
                    <span className="font-mono text-[10px] font-bold">1985-03-15</span>
                 </div>
                 <div className="border border-black/10 p-3 bg-surface-container flex justify-between items-center">
                    <span className="font-mono text-[10px] text-black uppercase">Locality:</span>
                    <span className="font-mono text-[10px] font-bold">Vasant Kunj</span>
                 </div>
               </div>

               <div>
                 <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-2">Linked References:</div>
                 <div className="flex gap-2">
                    <span className="font-mono text-[10px] border border-black/20 px-2 py-1 bg-white font-bold">CCTNS</span>
                    <span className="font-mono text-[10px] border border-black/20 px-2 py-1 bg-white font-bold">NCRB</span>
                    <span className="font-mono text-[10px] border border-black/20 px-2 py-1 bg-white font-bold">VAHAN</span>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-black/10">
                 <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Reason for selection (required)</label>
                 <select disabled={identityLocked} className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black appearance-none mb-6 disabled:opacity-50">
                    <option>Highest confidence with corroborating physical marks</option>
                    <option>Multiple source verification (3+ databases)</option>
                    <option>DOB exact match with primary records</option>
                    <option>Locality cluster consistency</option>
                    <option>Biometric data alignment</option>
                    <option>Historical record correlation</option>
                    <option>Witness statement corroboration</option>
                 </select>

                 <button 
                  onClick={() => setIdentityLocked(true)}
                  disabled={identityLocked}
                  className={`w-full py-4 text-black font-mono text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-transparent ${identityLocked ? 'bg-green-100 border-green-500 text-green-700 opacity-100' : 'bg-primary-fixed hover:bg-black hover:text-white hover:border-black'}`}
                 >
                    <span className="material-symbols-outlined">{identityLocked ? 'lock' : 'lock_open'}</span> 
                    {identityLocked ? 'Identity Locked' : 'Lock Identity'}
                 </button>
               </div>
            </div>
         </div>
       </div>
    </div>
  )
}
function StepPublishFRS() { 
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [published, setPublished] = useState(false);

  return (
    <div className="w-full flex-1 flex flex-col">
       <div className="flex gap-6 flex-1">
         {/* Left Side: Reference Frame Preview */}
         <div className="w-[400px] shrink-0 flex flex-col gap-6">
            <div>
               <h2 className="font-headline font-black text-xl uppercase tracking-widest text-black flex items-center gap-2 mb-1">
                 <span className="material-symbols-outlined text-2xl">photo_camera</span>
                 Reference Frame Preview
               </h2>
               <p className="font-mono text-xs text-black">Face enrolled in FRS database</p>
            </div>

            <div className="border border-black/10 bg-white p-4 relative">
               <img src={img("/images/Raju 1.jpeg")} alt="FRS Enrolled" className="w-full aspect-video object-cover object-top" />
               <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-fixed text-black font-mono text-[9px] font-bold px-2 py-1 flex flex-col items-center border border-black">
                 <span className="material-symbols-outlined text-[12px]">filter_center_focus</span>
                 FRS Enrolled: 86%
               </div>
               <div className="absolute bottom-4 left-4 right-4 flex justify-between font-mono text-[10px] text-white bg-black/60 px-2 py-1 items-center">
                  <div className="flex flex-col">
                     <span className="bg-primary-fixed text-black px-1 border border-black font-bold uppercase tracking-widest">Reference Frame</span>
                     <span>Richard Fernandes</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Ready for FRS
                  </div>
               </div>
            </div>

            <div className="border border-black/10 bg-white p-4 flex gap-4 items-center mt-auto">
               <div className="w-16 h-16 bg-surface-container shrink-0">
                  <img src={img("/images/Raju 1.jpeg")} alt="Profile" className="w-full h-full object-cover object-top" />
               </div>
               <div>
                  <h4 className="font-headline font-bold text-lg leading-tight uppercase">Richard Fernandes</h4>
                  <div className="font-mono text-[9px] text-black mt-1">Aliases: Raju, Ricky F</div>
                  <div className="font-mono text-[10px] mt-2">Identity confidence: <span className="font-bold bg-primary-fixed text-black px-1 border border-black">86%</span></div>
               </div>
            </div>
         </div>

         {/* Right Side: FRS Publish Controls */}
         <div className="flex-1 flex flex-col">
            <div className="mb-6">
               <h2 className="font-headline font-black text-xl uppercase tracking-widest text-black flex items-center gap-2 mb-1">
                 <span className="material-symbols-outlined text-2xl bg-primary-fixed text-black border border-black p-1 rounded-sm">center_focus_strong</span>
                 FRS Publish Controls
               </h2>
               <p className="font-mono text-xs text-black">Configure watchlist alert settings</p>
            </div>

            <div className="bg-white border border-black/10 p-6 flex-1 flex flex-col relative">
               {published && (
                  <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                     <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg border border-green-200">
                        <span className="material-symbols-outlined text-5xl">done_all</span>
                     </div>
                     <h3 className="font-headline text-3xl font-black text-black mb-2 uppercase tracking-widest">Target Published</h3>
                     <p className="font-mono text-black max-w-md">Identity packet synced to national FRS network. Local perimeter alerts deployed at {priority} priority.</p>
                     <div className="mt-8 font-mono text-[10px] text-black uppercase tracking-widest">
                        Awaiting CCTV match signals...
                     </div>
                  </div>
               )}

               <h3 className="font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-6">Zone Alert Thresholds</h3>
               
               <div className="space-y-6 flex-1">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <div>
                           <div className="font-mono text-sm font-bold">Central Business District</div>
                           <div className="font-mono text-[10px] text-black">42 cameras</div>
                        </div>
                        <div className="font-mono text-xl font-bold bg-primary-fixed text-black px-1 border border-black">85%</div>
                     </div>
                     <div className="w-full h-1 bg-surface-container border border-black"><div className="h-full bg-black" style={{ width: '85%' }}></div></div><div className="mt-2 font-mono text-[10px] text-black font-bold uppercase">Threshold Automatically Set</div>
                  </div>
                  
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <div>
                           <div className="font-mono text-sm font-bold">Railway Station Complex</div>
                           <div className="font-mono text-[10px] text-black">28 cameras</div>
                        </div>
                        <div className="font-mono text-xl font-bold bg-primary-fixed text-black px-1 border border-black">90%</div>
                     </div>
                     <div className="w-full h-1 bg-surface-container border border-black"><div className="h-full bg-black" style={{ width: '90%' }}></div></div><div className="mt-2 font-mono text-[10px] text-black font-bold uppercase">Threshold Automatically Set</div>
                  </div>

                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <div>
                           <div className="font-mono text-sm font-bold">Residential - Vasant Kunj</div>
                           <div className="font-mono text-[10px] text-black">15 cameras</div>
                        </div>
                        <div className="font-mono text-xl font-bold bg-primary-fixed text-black px-1 border border-black">75%</div>
                     </div>
                     <div className="w-full h-1 bg-surface-container border border-black"><div className="h-full bg-black" style={{ width: '75%' }}></div></div><div className="mt-2 font-mono text-[10px] text-black font-bold uppercase">Threshold Automatically Set</div>
                  </div>
               </div>

               <div className="border-t border-black/10 pt-6 mt-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Scope</label>
                        <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-black appearance-none">
                           <option>All Cameras</option>
                           <option>Selected Zones Only</option>
                        </select>
                     </div>
                     <div>
                        <label className="block font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-2">Priority</label>
                        <div className="flex">
                           <button 
                              onClick={() => setPriority('High')}
                              className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${priority === 'High' ? 'bg-error text-white' : 'bg-surface-container border border-black/20 text-black hover:bg-black/5'} `}
                           >
                              High
                           </button>
                           <button 
                              onClick={() => setPriority('Medium')}
                              className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors border-y border border-black/20 ${priority === 'Medium' ? 'bg-[#ffba38] border-[#ffba38] text-black' : 'bg-surface-container text-black hover:bg-black/5'} `}
                           >
                              Medium
                           </button>
                           <button 
                              onClick={() => setPriority('Low')}
                              className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${priority === 'Low' ? 'bg-primary-fixed border border-primary-fixed text-black' : 'bg-surface-container border border-black/20 text-black hover:bg-black/5'} `}
                           >
                              Low
                           </button>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setPublished(true)} className="w-full py-4 bg-primary-fixed text-black font-mono text-sm font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black">
                     <span className="material-symbols-outlined">center_focus_strong</span> Publish to FRS
                  </button>
               </div>
            </div>
         </div>
       </div>
    </div>
  )
}
function StepCctvSearch({ onComplete }: { onComplete?: () => void }) {
  const [status, setStatus] = useState<'setup' | 'searching' | 'complete'>('setup');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
     let interval: any;
     if (status === 'searching') {
        interval = setInterval(() => {
           setProgress(p => Math.min(p + 2, 100));
        }, 50);
     }
     return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
     if (progress === 100 && status === 'searching') {
        setStatus('complete');
        if (onComplete) onComplete();
     }
  }, [progress, status, onComplete]);

  const hits = [
    { cam: 'CAM-NDLS-012', desc: 'NDLS Platform 3', time: '2026-04-27 14:32:18', match: 92, img: img('/images/Raju 4.jpeg')},
    { cam: 'CAM-CP-008', desc: 'Connaught Place A-Block', time: '2026-04-27 14:28:45', match: 88, img: img('/images/Raju 3.jpeg')},
    { cam: 'CAM-ISBT-023', desc: 'Kashmere Gate ISBT', time: '2026-04-27 14:15:32', match: 85, img: img('/images/Raju 2.jpeg')},
    { cam: 'CAM-HK-041', desc: 'Hauz Khas Village Entry', time: '2026-04-27 13:58:21', match: 79, img: img('/images/Raju 1.jpeg')},
  ];

  const localities = [
    "North Delhi: Civil Lines, Sadar Bazaar, Kotwali",
    "South Delhi: Hauz Khas, Saket, Vasant Kunj",
    "East Delhi: Preet Vihar, Gandhi Nagar, Shahdara",
    "West Delhi: Rajouri Garden, Punjabi Bagh, Patel Nagar",
    "Central: Connaught Place, Paharganj, Karol Bagh"
  ];
  
  const [scrollingLocalityIndex, setScrollingLocalityIndex] = useState(0);

  useEffect(() => {
    if (status === 'searching') {
       const locInterval = setInterval(() => {
          setScrollingLocalityIndex(curr => (curr + 1) % localities.length);
       }, 1500);
       return () => clearInterval(locInterval);
    }
  }, [status, localities.length]);

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-surface-container border border-black/20 overflow-hidden relative">
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

       <div className="relative z-10 p-8 flex flex-col h-full">
         
         {/* Profile Card */}
         <div className="bg-white border border-black/10 p-6 flex flex-col gap-4 shadow-sm mb-8">
            <h3 className="font-mono text-[10px] text-black uppercase font-bold tracking-widest border-b border-black/10 pb-2">Target Profile</h3>
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-surface-container shrink-0 border border-black/10">
                   <img src={img("/images/Raju 1.jpeg")} alt="Subject" className="w-full h-full object-cover" />
                </div>
                <div>
                   <div className="flex items-center gap-4 mb-1">
                     <h2 className="text-xl font-headline font-black uppercase text-black">Richard Fernandes</h2>
                     <span className="text-black border border-black/20 bg-surface-container px-2 py-0.5 text-[10px] font-mono tracking-widest font-bold">WL-MOGQ6W54</span>
                   </div>
                   <div className="text-xs font-mono text-black mb-2">
                     Identity Confidence: <span className="font-bold bg-primary-fixed text-black px-1 border border-black">86%</span>
                   </div>
                   <div className="flex gap-2">
                     <span className="bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5">Raju</span>
                     <span className="bg-surface-container border border-black/20 text-black text-[9px] font-mono font-bold px-2 py-0.5">Ricky F</span>
                   </div>
                </div>
            </div>
         </div>

         {/* Setup State */}
         {status === 'setup' && (
           <div className="flex-1 flex flex-col bg-white border border-black/10 p-8">
             <div className="mb-8">
                <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-white bg-black rounded-sm p-1">videocam</span>
                  Live CCTV Search Setup
                </h2>
                <p className="font-mono text-sm text-black mt-2">Configure parameters for city-wide facial recognition scan.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-8 mb-8">
               <div>
                  <label className="block font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-3">Time Window</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-surface-container border border-black/20 text-black font-mono text-sm p-4 focus:outline-none focus:border-black transition-colors cursor-pointer">
                       <option>Last 24 hours</option>
                       <option>Last 48 hours</option>
                       <option>Last 7 days</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">expand_more</span>
                  </div>
               </div>
               <div>
                  <label className="block font-mono text-[10px] text-black uppercase font-bold tracking-widest mb-3">Scope</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-surface-container border border-black/20 text-black font-mono text-sm p-4 focus:outline-none focus:border-black transition-colors cursor-pointer">
                       <option>All Delhi NCR CCTV</option>
                       <option>Transport Hubs Only</option>
                       <option>Selected Districts</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">expand_more</span>
                  </div>
               </div>
             </div>

             <div className="flex justify-end mt-auto">
               <button 
                  onClick={() => setStatus('searching')}
                  className="bg-primary-fixed hover:bg-black text-black hover:text-white font-mono text-sm uppercase tracking-widest font-bold py-4 px-8 flex items-center justify-center gap-3 transition-all min-w-[300px] border border-transparent hover:border-black">
                  <span className="material-symbols-outlined">search</span> Search All CCTV
               </button>
             </div>
           </div>
         )}

         {/* Searching State */}
         {status === 'searching' && (
            <div className="flex-1 flex flex-col justify-center items-center">
               <div className="bg-white border border-black/10 p-12 flex flex-col items-center max-w-2xl w-full text-center shadow-sm">
                  <div className="mb-8 relative">
                     <span className="material-symbols-outlined text-6xl bg-primary-fixed text-black px-1 border border-black animate-spin absolute inset-0 opacity-20">radar</span>
                     <span className="material-symbols-outlined text-6xl text-black relative z-10 animate-pulse">videocam</span>
                  </div>
                  <h3 className="font-headline font-black text-2xl uppercase tracking-widest mb-2">Searching Citywide Network</h3>
                  <div className="h-6 overflow-hidden mb-8 w-full max-w-sm relative">
                     <p key={scrollingLocalityIndex} className="font-mono text-xs text-black uppercase animate-[slideUp_0.3s_ease-out] absolute w-full text-center">
                        Scanning {localities[scrollingLocalityIndex]}...
                     </p>
                  </div>
                  
                  <div className="w-full h-2 bg-surface-container border border-black/10 relative overflow-hidden mb-4">
                     <div className="absolute top-0 left-0 h-full bg-primary-fixed transition-all duration-75" style={{ width: `${progress}%` }}></div>
                     <div className="absolute inset-0 bg-white/40 w-full animate-[shimmer_2s_infinite] -translate-x-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}></div>
                  </div>
                  <div className="font-mono text-[10px] font-bold text-black uppercase tracking-widest">{Math.floor(progress)}% Complete</div>
               </div>
            </div>
         )}

         {/* Complete State */}
         {status === 'complete' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white border border-black/10 p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-green-100 border border-green-500 flex items-center justify-center text-green-700">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                     </div>
                     <div>
                        <h3 className="font-headline font-black text-2xl uppercase tracking-widest text-black mb-1">Search Complete</h3>
                        <p className="font-mono text-xs text-black uppercase">4 detections found - Select one to continue tracking</p>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                  {hits.map((hit, i) => (
                     <div key={i} className="bg-surface-container border border-black/10 p-4 flex gap-5 hover:border-black hover:shadow-md transition-all cursor-pointer group">
                        <div className="relative w-32 h-24 border border-black/10 shrink-0 overflow-hidden bg-black">
                           <img src={hit.img} alt={hit.cam} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-80 transition-all duration-500" />
                           <div className="absolute top-2 right-2 bg-primary-fixed text-black text-[9px] font-bold px-1.5 py-0.5 border border-black">
                              {hit.match}%
                           </div>
                        </div>
                        <div className="flex flex-col justify-center w-full">
                           <div className="flex justify-between items-start w-full mb-2">
                              <span className="text-black font-mono text-sm tracking-widest font-bold uppercase">{hit.cam}</span>
                              <span className="text-black text-[9px] font-mono">{hit.time}</span>
                           </div>
                           <div className="text-black font-mono text-xs mb-3">{hit.desc}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
       </div>
    </div>
  )
}

function StepDetection() { 
  const hits = [
    { cam: 'CAM-CBD-04', loc: 'Connaught Place - Inner Circle', time: '14:22:05', acc: 88, frame: img('/images/Raju 3.jpeg')},
    { cam: 'CAM-CBD-12', loc: 'Janpath Intersection', time: '14:35:10', acc: 92, frame: img('/images/Raju Motorcycle.jpeg')},
    { cam: 'CAM-RLY-02', loc: 'New Delhi Railway Stn - Gate 1', time: '15:10:45', acc: 85, frame: img('/images/Raju 2.jpeg')},
    { cam: 'CAM-RLY-05', loc: 'New Delhi Railway Stn - Platform 3', time: '15:15:20', acc: 89, frame: img('/images/Raju 3.jpeg')}
  ];

  return (
    <div className="w-full flex-1 flex flex-col">
       <div className="mb-6 flex justify-between items-end border-b border-black/10 pb-4">
         <div>
           <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl">policy</span>
             Detections Found
           </h2>
           <p className="font-mono text-sm text-black mt-1">4 hits matched with Canonical Profile</p>
         </div>
       </div>

       <div className="grid grid-cols-2 gap-6">
          {hits.map((hit, i) => (
             <div key={i} className="bg-white border border-black/10 p-4 hover:border-black transition-colors flex gap-4">
                <div className="w-1/3 relative shrink-0">
                  <img src={hit.frame || img("/images/Raju 1.jpeg")} alt={hit.cam} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-primary-fixed text-black font-mono text-[9px] font-bold px-1.5 border border-black">
                    {hit.acc}% Match
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                   <div className="font-mono text-[10px] text-black uppercase mb-1">{hit.time}</div>
                   <h4 className="font-headline font-bold text-lg uppercase leading-tight mb-2">{hit.cam}</h4>
                   <div className="font-mono text-[10px] text-black flex items-start gap-1">
                     <span className="material-symbols-outlined text-[14px]">location_on</span>
                     {hit.loc}
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}
function StepCorrelation() { 
  const timeline = [
    { time: '14:22', cam: 'CAM-CBD-04', type: 'First Seen', loc: 'Connaught Place A-Block' },
    { time: '14:35', cam: 'CAM-CBD-12', type: 'Movement', loc: 'Rajiv Chowk Metro Gate 3' },
    { time: '14:50', cam: 'CAM-CBD-18', type: 'Evasion suspected', loc: 'Paharganj Market Entry' },
    { time: '15:10', cam: 'CAM-RLY-02', type: 'Station Entry', loc: 'NDLS Ajmeri Gate Side' },
    { time: '15:15', cam: 'CAM-RLY-05', type: 'Platform Wait', loc: 'NDLS Platform 3' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col h-full overflow-hidden">
       <div className="mb-8 flex justify-between items-end border-b border-black/10 pb-4 shrink-0">
         <div>
           <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl">timeline</span>
             Multi-Camera Correlation
           </h2>
           <p className="font-mono text-sm text-black mt-1">Event timeline and exact sequence of spotting across Delhi NCR</p>
         </div>
       </div>

       <div className="bg-white border border-black/10 p-8 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex w-full justify-between items-start relative mb-12 flex-1">
             <div className="absolute top-10 left-8 right-8 h-1 bg-black/10 z-0"></div>
             {timeline.map((item, i) => (
                <div key={i} className="flex flex-col items-center relative z-10 group w-32">
                   <div className="font-mono text-sm text-black mb-2 font-bold bg-surface-container px-3 py-1 border border-black/10 mx-auto">{item.time}</div>
                   <div className="w-20 h-20 rounded-full border-4 border-white bg-black shadow-md overflow-hidden group-hover:scale-110 transition-transform cursor-pointer relative">
                      <img src={`/images/Raju ${i%4 + 1}.jpeg`} alt="cam" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary-fixed/0 group-hover:bg-primary-fixed/20 transition-colors"></div>
                   </div>
                   <div className="mt-4 text-center">
                      <div className="font-mono text-xs font-bold text-black uppercase mb-1">{item.cam}</div>
                      <div className="font-mono text-xs text-black font-medium leading-tight mb-2 h-8 flex items-center justify-center">
                         {item.loc}
                      </div>
                      <div className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 mx-auto max-w-[120px] border ${item.type.includes('Evasion') ? 'bg-error/10 border-error text-error shadow-sm' : 'bg-surface-container border-black/20 text-black'}`}>{item.type}</div>
                   </div>
                </div>
             ))}
          </div>

          <div className="w-full grid grid-cols-4 gap-6 pt-8 border-t border-black/10 shrink-0">
             <div className="text-center bg-surface-container p-4 border border-black/10">
                <div className="font-headline text-4xl font-black">5</div>
                <div className="font-mono text-[10px] text-black uppercase tracking-widest mt-1">Confirmed Hits</div>
             </div>
             <div className="text-center bg-surface-container p-4 border border-black/10">
                <div className="font-headline text-4xl font-black">53<span className="text-xl">m</span></div>
                <div className="font-mono text-[10px] text-black uppercase tracking-widest mt-1">Total Duration</div>
             </div>
             <div className="text-center bg-surface-container p-4 border border-black/10">
                <div className="font-headline text-4xl font-black">2.1<span className="text-xl">km</span></div>
                <div className="font-mono text-[10px] text-black uppercase tracking-widest mt-1">Distance Tracked</div>
             </div>
             <div className="text-center bg-surface-container p-4 border border-black/10 shrink-0">
                <div className="font-headline text-4xl font-black bg-primary-fixed text-black px-1 border border-black">88<span className="text-xl">%</span></div>
                <div className="font-mono text-[10px] text-black uppercase tracking-widest mt-1">Avg Confidence</div>
             </div>
          </div>
       </div>
    </div>
  )
}

function StepAnalytics() { 
  const patterns = [
    { name: 'Watchlist Match', level: 'HIGH', desc: 'Subject identified in active warrant database via FUSION. Last known jurisdiction: Vasant Kunj, New Delhi.' },
    { name: 'Repeated Passes', level: 'HIGH', desc: 'Same route crossed 4 times in 20 minutes outside NDLS Ajmeri Gate Drop-off zone.' },
    { name: 'Perimeter Probing', level: 'MEDIUM', desc: 'Subject lingered near restricted employee entrances at Connaught Place Metro Station.' },
    { name: 'Object Handling', level: 'MEDIUM', desc: 'Subject deposited unverified bag near NDLS Platform 3 waiting area.' },
    { name: 'Camera Evasion', level: 'LOW', desc: 'Face averted from cameras at 3 known intersection points (Paharganj Market Entry).' },
    { name: 'Group Contact', level: 'LOW', desc: 'Brief interaction with unknown individuals at Rajiv Chowk Entry Gate 3.' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col h-full overflow-hidden">
       <div className="mb-8 flex justify-between items-end border-b border-black/10 pb-4 shrink-0">
         <div>
           <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-black flex items-center gap-3">
             <span className="material-symbols-outlined text-3xl">psychology</span>
             Behavioral Analytics
           </h2>
           <p className="font-mono text-sm text-black mt-1">AI assessment of target activity patterns across recorded timelines</p>
         </div>
         <div className="text-right">
            <div className="font-mono text-xs uppercase font-bold text-black mb-1">Overall Risk Score</div>
            <div className="font-headline text-5xl font-black text-error leading-none flex items-center justify-end gap-2">
               <span className="material-symbols-outlined text-[36px]">warning</span>
               76
            </div>
         </div>
       </div>

       <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar">
          {patterns.map((p, i) => (
             <div key={i} className={`border border-black/10 bg-white p-6 flex flex-col justify-between hover:border-black transition-colors group
                ${p.level === 'HIGH' ? 'border-l-[6px] border-l-error bg-error/5' : p.level === 'MEDIUM' ? 'border-l-[6px] border-l-[#ffba38]' : 'border-l-[6px] border-l-black/30'}
             `}>
                <div className="flex justify-between items-start mb-4">
                   <h4 className="font-mono text-base font-bold uppercase tracking-widest leading-tight w-2/3">{p.name}</h4>
                   <span className={`font-mono text-[10px] font-bold px-3 py-1 
                      ${p.level === 'HIGH' ? 'bg-error text-white' : p.level === 'MEDIUM' ? 'bg-[#ffba38] text-black' : 'bg-surface-container text-black border border-black/20'}
                   `}>{p.level}</span>
                </div>
                <div className="flex items-start gap-4">
                   <span className={`material-symbols-outlined shrink-0 ${p.level === 'HIGH' ? 'text-error' : p.level === 'MEDIUM' ? 'text-[#ffba38]' : 'text-black'}`}>
                      {p.level === 'HIGH' ? 'gavel' : p.level === 'MEDIUM' ? 'manage_search' : 'visibility'}
                   </span>
                   <p className="font-mono text-sm text-black leading-relaxed font-medium">{p.desc}</p>
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}

