import { img } from '../utils/imagePath';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../components/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuditLog } from '../context/AuditLogContext';
import { generateOfflineCopilotResponse } from '../services/offlineGemma';
import { IS_OFFLINE_DEMO, OFFLINE_TILE_ATTRIBUTION, OFFLINE_TILE_URL } from '../utils/offlineDemo';

const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined;

interface Message {
  role: 'user' | 'ai';
  text: string;
  location?: [number, number];
}

const customIcon = IS_OFFLINE_DEMO
  ? new L.DivIcon({
      className: 'bg-transparent',
      html: '<div class="h-6 w-6 rounded-full border-2 border-black bg-[#ffe600] shadow-[0_0_16px_rgba(255,230,0,0.9)]"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    })
  : new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

export default function Copilot() {
  const location = useLocation();
  const { addLog } = useAuditLog();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Sentinel AI Copilot online. I am equipped to assist with video analytics, city intelligence, safety, traffic, and public infrastructure inquiries across Delhi. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessed = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateLastAiMessage = (text: string) => {
    setMessages(prev => {
      const msgs = [...prev];
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text };
      return msgs;
    });
  };

  const handleSendMessage = async (messageText: string = input, locationData?: [number, number]) => {
    if (!messageText.trim()) return;

    const userMsg = messageText;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    addLog('AI_INTERACTION', `User sent message to Copilot: "${userMsg}"`);

    try {
      if (IS_OFFLINE_DEMO) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Preparing local LFM2.5 1.2B...', location: locationData }]);
        setIsTyping(false);
        const response = await generateOfflineCopilotResponse(userMsg, updateLastAiMessage, updateLastAiMessage);
        updateLastAiMessage(response);
        return;
      }

      if (!WORKER_URL) throw new Error('VITE_WORKER_URL is not set - add it to your environment and redeploy.');

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok || !response.body) {
        let errMsg = `Worker error ${response.status}`;
        try {
          const errBody = await response.json() as { error?: string };
          if (errBody?.error) errMsg = errBody.error;
        } catch { /* not JSON */ }
        throw new Error(errMsg);
      }

      setMessages(prev => [...prev, { role: 'ai', text: '', location: locationData }]);
      setIsTyping(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (text) {
              accumulatedText += text;
              updateLastAiMessage(accumulatedText);
            }
          } catch { /* skip malformed SSE chunk */ }
        }
      }
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${msg}` }]);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (location.state?.initialMessage && !initialMessageProcessed.current) {
      initialMessageProcessed.current = true;
      handleSendMessage(location.state.initialMessage, location.state.location);
    }
  }, [location.state]);

  return (
    <div className="relative w-full h-full flex flex-col bg-surface-dim">
      <div className="flex justify-between items-end p-8 pb-4 border-b border-black/10">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">AI COPILOT</h1>
          <p className="font-mono text-xs text-black mt-1 tracking-widest">
            VIDEO ANALYTICS & CITY INTELLIGENCE ASSISTANT
            {IS_OFFLINE_DEMO && <span className="ml-3 bg-primary-fixed px-2 py-0.5 font-bold">LOCAL LFM MODE</span>}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col max-w-[70%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={cn("p-4 text-sm font-mono shadow-lg whitespace-pre-wrap", msg.role === 'user' ? "bg-primary-fixed text-black border border-black/10" : "bg-surface-container-high text-black border border-black/10")}>
                  {msg.text}

                  {msg.role === 'ai' && msg.location && (
                    <div className="mt-4 h-48 w-[400px] max-w-full border border-black/20 rounded overflow-hidden">
                      <MapContainer
                        center={msg.location}
                        zoom={15}
                        style={{ height: '100%', width: '100%', background: '#000000' }}
                        zoomControl={false}
                      >
                        <TileLayer
                          url={IS_OFFLINE_DEMO ? OFFLINE_TILE_URL : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
                          attribution={IS_OFFLINE_DEMO ? OFFLINE_TILE_ATTRIBUTION : 'Tiles &copy; Esri'}
                        />
                        <div className="absolute inset-0 bg-white/40 pointer-events-none z-[400]" />
                        <Marker position={msg.location} icon={customIcon}>
                          <Popup>
                            <div className="font-mono text-xs text-black font-bold border-b border-black/10 pb-1 mb-2">Anomaly Location</div>
                            <div className="grid grid-cols-2 gap-1 min-w-[200px]">
                              <img src={img("/images/survey 1.jpeg")} alt="Survey 1" className="w-full h-12 object-cover border border-black/10" />
                              <img src={img("/images/survey 2.jpeg")} alt="Survey 2" className="w-full h-12 object-cover border border-black/10" />
                              <img src={img("/images/survey 3.png")} alt="Survey 3" className="w-full h-12 object-cover border border-black/10" />
                              <img src={img("/images/survey 4.png")} alt="Survey 4" className="w-full h-12 object-cover border border-black/10" />
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto items-start bg-surface-container-high text-black border border-black/10 p-4 text-sm font-mono animate-pulse shadow-lg">
                Analyzing intelligence feeds...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-black/10 bg-surface-container-lowest">
            <div className="flex gap-4 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about video analytics, traffic, safety anomalies, or infrastructure status..."
                className="flex-1 bg-surface-container border border-black/20 text-black font-mono text-sm p-4 focus:outline-none focus:border-primary-fixed shadow-inner"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping || !input.trim()}
                className="bg-primary-fixed text-black px-8 font-bold font-mono hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">send</span>
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
