'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  Play, 
  Square, 
  Activity, 
  Wifi, 
  Battery, 
  Volume2, 
  RefreshCw, 
  Tv, 
  Sliders, 
  Maximize2, 
  Sparkles,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { ScoringService } from '@/lib/api/scoring';
import { useSearchParams } from 'next/navigation';

export default function StreamStudioPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [state, setState] = useState<any | null>(null);
  
  const searchParams = useSearchParams();
  const initialKey = searchParams.get('key') || '';
  const initialCourt = searchParams.get('court') || 'Court 1';
  
  // Broadcaster State
  const [streamKey, setStreamKey] = useState(initialKey);
  const [courtName, setCourtName] = useState(initialCourt);
  const [profile, setProfile] = useState<'HD_720P_30' | 'FHD_1080P_30' | 'FHD_1080P_60'>('HD_720P_30');
  const [streamState, setStreamState] = useState<'IDLE' | 'CONNECTING' | 'LIVE' | 'DEGRADED' | 'RECONNECTING'>('IDLE');
  
  // Devices
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Telemetry & Metrics
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [bitrateKbps, setBitrateKbps] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [batteryPct, setBatteryPct] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    params.then(p => setMatchId(p.matchId));
  }, [params]);

  // Query Media Devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const v = devices.filter(d => d.kind === 'videoinput');
      const a = devices.filter(d => d.kind === 'audioinput');
      setVideoDevices(v);
      setAudioDevices(a);
      if (v.length > 0 && !selectedCamera) setSelectedCamera(v[0].deviceId);
      if (a.length > 0 && !selectedMic) setSelectedMic(a[0].deviceId);
    } catch (err) {
      console.warn('Failed to enumerate media devices', err);
    }
  }, [selectedCamera, selectedMic]);

  useEffect(() => {
    refreshDevices();
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryPct(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryPct(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, [refreshDevices]);

  // Read-only Match State polling (Existing scoring system unchanged)
  useEffect(() => {
    if (!matchId) return;
    const fetchState = async () => {
      try {
        const res = await ScoringService.getState(matchId as string);
        if (res && res.data && res.data.scoreMeta) {
          setState(res.data.scoreMeta);
        }
      } catch (err) {
        console.error('Overlay state fetch failed', err);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [matchId]);

  // Screen WakeLock Management
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (e) {
      console.warn('WakeLock request denied', e);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Canvas Compositor Drawing Loop
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    if (!canvas || !ctx) return;

    // 1. Draw Camera Frame
    if (video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Render Scoreboard Overlay Graphics
    if (state && state.config) {
      renderBroadcasterOverlay(ctx, state, courtName, canvas.width, canvas.height);
    }

    // Audio VU Meter updates
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);
  }, [state, courtName]);

  // Start Live Streaming
  const startStream = async () => {
    if (!streamKey.trim()) {
      setErrorMessage("Please enter a YouTube Stream Key");
      return;
    }
    setErrorMessage(null);
    setStreamState('CONNECTING');

    try {
      await requestWakeLock();

      const targetFps = profile === 'FHD_1080P_60' ? 60 : 30;
      const targetWidth = profile === 'HD_720P_30' ? 1280 : 1920;
      const targetHeight = profile === 'HD_720P_30' ? 720 : 1080;

      // 1. Ingest Camera and Mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera 
          ? { deviceId: { exact: selectedCamera }, width: { ideal: targetWidth }, height: { ideal: targetHeight }, frameRate: { ideal: targetFps } }
          : { facingMode, width: { ideal: targetWidth }, height: { ideal: targetHeight }, frameRate: { ideal: targetFps } },
        audio: selectedMic 
          ? { deviceId: { exact: selectedMic }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true }
      });

      rawStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 2. Setup Web Audio Analyser for VU Meter
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (e) {
        console.warn('Audio analyser setup skipped', e);
      }

      // 3. Connect to Backend WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_API_URL 
        ? new URL(process.env.NEXT_PUBLIC_API_URL).host 
        : 'localhost:5050';
      const ws = new WebSocket(`${protocol}//${host}/ws/livestream`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send start broadcast handshake
        ws.send(JSON.stringify({
          action: 'START_BROADCAST',
          streamKey: streamKey.trim(),
          profile
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.status === 'STREAM_READY') {
            setStreamState('LIVE');
            startRecordingAndDispatch(stream, targetFps);
          } else if (msg.status === 'ERROR') {
            setErrorMessage(msg.message || 'Streaming rejected by server');
            stopStream();
          }
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      ws.onerror = () => {
        setErrorMessage('Failed to connect to Athlon streaming gateway');
        setStreamState('IDLE');
      };

      ws.onclose = () => {
        if (streamState === 'LIVE') {
          setStreamState('RECONNECTING');
        }
      };

      // Start rendering loop
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(drawFrame);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to initialize camera or stream");
      setStreamState('IDLE');
    }
  };

  const startRecordingAndDispatch = (stream: MediaStream, fps: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasStream = canvas.captureStream(fps);
    stream.getAudioTracks().forEach(track => canvasStream.addTrack(track));

    const targetBps = profile === 'HD_720P_30' ? 4000000 : profile === 'FHD_1080P_60' ? 10000000 : 8000000;

    let mimeType = 'video/webm; codecs=vp8,opus';
    if (MediaRecorder.isTypeSupported('video/webm; codecs=h264,opus')) {
      mimeType = 'video/webm; codecs=h264,opus';
    }

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: targetBps
    });
    mediaRecorderRef.current = mediaRecorder;

    let lastBytes = 0;
    let lastTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(event.data);

        // Bitrate calculation
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        if (delta >= 1) {
          const kbps = Math.round(((event.data.size) * 8) / (delta * 1000));
          setBitrateKbps(kbps);
          lastTime = now;
        }
      }
    };

    mediaRecorder.start(1000); // 1-second slices

    // Timer
    setDurationSec(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setDurationSec(prev => prev + 1);
    }, 1000);
  };

  const stopStream = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (rawStreamRef.current) {
      rawStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    releaseWakeLock();
    setStreamState('IDLE');
    setBitrateKbps(0);
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white p-3 sm:p-6 font-sans flex flex-col items-center">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Tv className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ATHLON Broadcast Studio
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">First-Party</span>
            </h1>
            <p className="text-xs text-white/50">{courtName} • Real-time YouTube Live Streamer</p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {batteryPct !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-white/70">
              <Battery className={`w-3.5 h-3.5 ${batteryPct < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
              <span>{batteryPct}%</span>
            </div>
          )}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-bold ${
            streamState === 'LIVE' 
              ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse' 
              : 'bg-white/5 border-white/10 text-white/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${streamState === 'LIVE' ? 'bg-red-500' : 'bg-white/40'}`} />
            {streamState}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="w-full max-w-5xl mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Broadcast Canvas / Video Preview */}
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Hidden Raw HTML Video Tag */}
          <video ref={videoRef} playsInline muted className="hidden" />
          
          {/* Composited High-DPI Output Canvas */}
          <canvas 
            ref={canvasRef} 
            width={profile === 'HD_720P_30' ? 1280 : 1920} 
            height={profile === 'HD_720P_30' ? 720 : 1080} 
            className="w-full h-full object-contain" 
          />

          {/* Over-Canvas Broadcast Telemetry HUD (Live only) */}
          {streamState === 'LIVE' && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>{formatTimer(durationSec)}</span>
                <span className="text-white/30">•</span>
                <span>{bitrateKbps} kbps</span>
              </div>

              {/* Audio VU Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-xs">
                <Volume2 className="w-3.5 h-3.5 text-white/70" />
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ${audioLevel > 80 ? 'bg-red-500' : audioLevel > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                    style={{ width: `${audioLevel}%` }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Studio Controls & Configuration Card */}
        <div className="bg-[#10141F] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
          {streamState === 'IDLE' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stream Key Configuration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">YouTube Stream Key</label>
                <input 
                  type="password" 
                  value={streamKey}
                  onChange={e => setStreamKey(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors"
                  placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
                />
                <p className="text-[11px] text-white/40">From YouTube Live Control Room</p>
              </div>

              {/* Quality Profile */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Broadcast Profile</label>
                <select
                  value={profile}
                  onChange={e => setProfile(e.target.value as any)}
                  className="w-full bg-[#07090E] border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors"
                >
                  <option value="HD_720P_30">720p @ 30 FPS • 4 Mbps (Stable Mobile)</option>
                  <option value="FHD_1080P_30">1080p @ 30 FPS • 8 Mbps (Recommended)</option>
                  <option value="FHD_1080P_60">1080p @ 60 FPS • 10 Mbps (Action Badminton)</option>
                </select>
                <p className="text-[11px] text-white/40">Strict 2.0s GOP keyframes enforced</p>
              </div>

              {/* Camera & Mic Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Device Source</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCamera}
                    onChange={e => setSelectedCamera(e.target.value)}
                    className="flex-1 bg-[#07090E] border border-white/15 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-primary truncate"
                  >
                    {videoDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                    ))}
                    {videoDevices.length === 0 && <option value="">Default Camera</option>}
                  </select>
                  <button 
                    onClick={toggleCameraFacing}
                    title="Toggle Front/Rear Camera"
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-white/40">Facing: {facingMode}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <div>
                  <h3 className="font-bold text-white text-base">Broadcasting Live to YouTube</h3>
                  <p className="text-xs text-white/50">Audio & dynamic scoreboard stream active</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/40 block">Quality</span>
                <span className="text-sm font-mono font-bold text-primary">{profile}</span>
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2 border-t border-white/10 flex gap-4">
            {streamState === 'IDLE' ? (
              <button 
                onClick={startStream}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 transition-all text-base"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start YouTube Live Stream</span>
              </button>
            ) : (
              <button 
                onClick={stopStream}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-base border border-white/10"
              >
                <Square className="w-5 h-5 fill-current text-red-400" />
                <span>End Broadcast</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TV Graphics Overlay Renderer (Badminton, Cricket, Volleyball, etc.)
// -------------------------------------------------------------
function renderBroadcasterOverlay(
  ctx: CanvasRenderingContext2D, 
  state: any, 
  courtName: string, 
  w: number, 
  h: number
) {
  ctx.save();

  // 1. Top-Right: ATHLON Watermark & Court Indicator
  const trWidth = 240;
  const trHeight = 44;
  const trX = w - trWidth - 30;
  const trY = 30;

  ctx.fillStyle = 'rgba(7, 9, 14, 0.85)';
  ctx.beginPath();
  ctx.roundRect(trX, trY, trWidth, trHeight, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Red LIVE dot
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(trX + 18, trY + 22, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText('ATHLON LIVE', trX + 32, trY + 26);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText(courtName.toUpperCase(), trX + 145, trY + 26);

  // 2. Scoreboard Banner (Top-Left compact glass card)
  const sbWidth = 440;
  const sbHeight = 116;
  const sbX = 30;
  const sbY = 30;

  ctx.fillStyle = 'rgba(10, 14, 23, 0.88)';
  ctx.beginPath();
  ctx.roundRect(sbX, sbY, sbWidth, sbHeight, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Color Accent Bar
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.roundRect(sbX, sbY, 5, sbHeight, [14, 0, 0, 14]);
  ctx.fill();

  const teamAStr = Array.isArray(state.config?.teamA) ? state.config.teamA.join(' / ') : (state.config?.teamA || 'Team A');
  const teamBStr = Array.isArray(state.config?.teamB) ? state.config.teamB.join(' / ') : (state.config?.teamB || 'Team B');

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(sbX + 20, sbY + 58);
  ctx.lineTo(sbX + sbWidth - 20, sbY + 58);
  ctx.stroke();

  // Team A Row
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText(truncateText(teamAStr, 24), sbX + 25, sbY + 40);

  // Team B Row
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText(truncateText(teamBStr, 24), sbX + 25, sbY + 96);

  // Sport Scores
  if (state.games !== undefined && Array.isArray(state.games)) {
    // Badminton Sets & Points
    const currentGame = state.games[state.currentGameIndex || 0] || { scoreA: 0, scoreB: 0 };
    
    // Set pill
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(sbX + sbWidth - 110, sbY + 16, 32, 34, 6);
    ctx.roundRect(sbX + sbWidth - 110, sbY + 68, 32, 34, 6);
    ctx.fill();

    // Sets won
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.setsA || 0}`, sbX + sbWidth - 94, sbY + 38);
    ctx.fillText(`${state.setsB || 0}`, sbX + sbWidth - 94, sbY + 90);

    // Current Points
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(sbX + sbWidth - 65, sbY + 16, 45, 34, 6);
    ctx.roundRect(sbX + sbWidth - 65, sbY + 68, 45, 34, 6);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(`${currentGame.scoreA ?? 0}`, sbX + sbWidth - 43, sbY + 40);
    ctx.fillText(`${currentGame.scoreB ?? 0}`, sbX + sbWidth - 43, sbY + 92);
    ctx.textAlign = 'start';

  } else if (state.runsA !== undefined) {
    // Cricket
    const oversA = Math.floor((state.validBallsA || 0) / 6) + "." + ((state.validBallsA || 0) % 6);
    const oversB = Math.floor((state.validBallsB || 0) / 6) + "." + ((state.validBallsB || 0) % 6);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${state.runsA || 0}/${state.wicketsA || 0} (${oversA})`, sbX + sbWidth - 25, sbY + 40);
    ctx.fillText(`${state.runsB || 0}/${state.wicketsB || 0} (${oversB})`, sbX + sbWidth - 25, sbY + 96);
    ctx.textAlign = 'start';

  } else if (state.goalsA !== undefined) {
    // Football
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${state.goalsA || 0}`, sbX + sbWidth - 25, sbY + 40);
    ctx.fillText(`${state.goalsB || 0}`, sbX + sbWidth - 25, sbY + 96);
    ctx.textAlign = 'start';
  }

  ctx.restore();
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
}
