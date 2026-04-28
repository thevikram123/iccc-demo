import { img } from '../utils/imagePath';
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLocation } from 'react-router-dom';
import { cn } from '../components/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuditLog } from '../context/AuditLogContext';

const API_KEY_STORAGE = 'iccc_gemini_api_key';

interface Message {
  role: 'user' | 'ai';
  text: string;
  location?: [number, number];
}

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ApiKeyGate({ onSave }: { onSave: (key: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-surface-container-high border border-black/10 p-8 max-w-lg w-full">
        <h2 className="font-headline font-black text-xl uppercase tracking-widest mb-1">Gemini API Key Required</h2>
        <p className="font-mono text-xs text-black/60 mb-6 leading-relaxed">
          Your key is stored only in this browser (localStorage) and never sent to any server other than Google. Get a free key at <span className="font-bold text-black">aistudio.google.com</span>.
        </p>
        <div className="flex gap-3">
          <input
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && value.trim() && onSave(value.trim())}
            placeholder="AIza..."
            className="flex-1 bg-surface-container border border-black/20 text-black font-mono text-sm p-3 focus:outline-none focus:border-black"
          />
          <button
            onClick={() => value.trim() && onSave(value.trim())}
            className="bg-primary-fixed text-black px-6 font-bold font-mono hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Copilot() {
  const location = useLocation();
  const { addLog } = useAuditLog();

  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Sentinel AI Copilot online. I am equipped to assist with video analytics, city intelligence, safety, traffic, and public infrastructure inquiries across Delhi. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessed = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
  };

  const handleSendMessage = async (messageText: string = input, locationData?: [number, number]) => {
    if (!messageText.trim()) return;

    const userMsg = messageText;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    addLog('AI_INTERACTION', `User sent message to Copilot: "${userMsg}"`);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemma-4-31b-it',
        contents: userMsg,
        config: {
          systemInstruction: `You are the AI Copilot for the Delhi Integrated Command and Control Centre (ICCC).
We have various kinds of video analytics running on CCTV cameras across Delhi, including:
- Pothole Detection
- Crowd / Mob Gathering
- ANPR (Automatic Number Plate Recognition)
- Dark Spot Identification
- Distress Detection (e.g., Women Safety)
- Traffic Violation Detection
- Incident & Anomaly Detection

You have access to a wide range of video analytics data, Delhi area intelligence, safety, traffic, and public infrastructure status.
When asked a question about a location or an issue (like "Potholes in Vasant Kunj?" or "Traffic violations in South Delhi"), you MUST provide a specific, authoritative, and structured situation report. DO NOT say you cannot see real-time markers or refer the user to other departments. You are the system.

Format your responses as a crisp, military-style INTELLIGENCE REPORT.
Include:
- INCIDENT SUMMARY
- ANALYTICS DATA (invent plausible numbers and specific camera IDs if needed to demonstrate the system's capability)
- RECOMMENDED ACTION (e.g., Dispatching PWD response team, escalating to traffic police)

IMPORTANT: Format your answers neatly as plain text. Do NOT use markdown formatting like asterisks (**), hashes (#), or backticks. Use clear spacing and paragraphs.`
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: '', location: locationData }]);
      setIsTyping(false);

      let accumulatedText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = accumulatedText;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error(error);
      let msg = error instanceof Error ? error.message : String(error);
      try {
        const parsed = JSON.parse(msg);
        const inner = parsed?.error?.message;
        if (inner) {
          try { msg = JSON.parse(inner)?.error?.message ?? inner; } catch { msg = inner; }
        }
      } catch { /* not JSON */ }
      if (msg.includes('API key') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
        clearApiKey();
      }
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
          <p className="font-mono text-xs text-black mt-1 tracking-widest">VIDEO ANALYTICS & CITY INTELLIGENCE ASSISTANT</p>
        </div>
        {apiKey && (
          <button
            onClick={clearApiKey}
            className="font-mono text-[10px] uppercase tracking-widest text-black/40 hover:text-black border border-black/10 hover:border-black px-3 py-1.5 transition-colors"
          >
            Change API Key
          </button>
        )}
      </div>

      {!apiKey ? (
        <ApiKeyGate onSave={saveApiKey} />
      ) : (
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
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri'
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
      )}
    </div>
  );
}
