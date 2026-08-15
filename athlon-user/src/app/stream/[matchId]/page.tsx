'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, StopCircle, PlayCircle, ActivityIcon } from 'lucide-react';
import { ScoringService } from '@/lib/api/scoring';
import { api } from '@/lib/api/client';
import { useSearchParams } from 'next/navigation';

export default function StreamPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [state, setState] = useState<any | null>(null);
  
  const searchParams = useSearchParams();
  const initialKey = searchParams.get('key') || '';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(initialKey);

  useEffect(() => {
    params.then(p => setMatchId(p.matchId));
  }, [params]);

  // Sync state from API
  useEffect(() => {
    if (!matchId) return;
    const fetchState = async () => {
      try {
        const res = await ScoringService.getState(matchId as string);
        if (res && res.data && res.data.scoreMeta) {
          setState(res.data.scoreMeta);
        }
      } catch (err) {
        console.error('Failed to fetch stream state', err);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [matchId]);

  const startStream = async () => {
    if (!streamKey) {
      alert("Please enter a YouTube Stream Key");
      return;
    }

    try {
      // 1. Get Camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 2. Connect WebSocket to Java Backend
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).host : 'localhost:5050';
      const ws = new WebSocket(`${protocol}//${host}/ws/livestream`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send initial metadata with stream key
        ws.send(JSON.stringify({ streamKey }));
      };

      // 3. Canvas Compositing Loop
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const drawFrame = () => {
        if (!isStreaming && ws.readyState !== WebSocket.OPEN) return;
        
        // Draw video
        if (videoRef.current) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }
        
        // Draw scoreboard overlay
        if (state && state.config) {
            // Background
            ctx.fillStyle = 'rgba(26, 34, 53, 0.9)';
            ctx.fillRect(40, 40, 400, 100);
            
            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px sans-serif';

            // Helper for team names which might be strings or arrays
            const teamAStr = Array.isArray(state.config.teamA) ? state.config.teamA.join('/') : state.config.teamA;
            const teamBStr = Array.isArray(state.config.teamB) ? state.config.teamB.join('/') : state.config.teamB;

            // Determine Sport and render accordingly
            if (state.goalsA !== undefined) {
                // Football
                ctx.fillText(`${teamAStr} - ${state.goalsA}`, 60, 75);
                ctx.fillText(`${teamBStr} - ${state.goalsB}`, 60, 115);
            } else if (state.runsA !== undefined) {
                // Cricket
                const oversA = Math.floor(state.validBallsA / 6) + "." + (state.validBallsA % 6);
                const oversB = Math.floor(state.validBallsB / 6) + "." + (state.validBallsB % 6);
                ctx.fillText(`${teamAStr} - ${state.runsA}/${state.wicketsA} (${oversA})`, 60, 75);
                ctx.fillText(`${teamBStr} - ${state.runsB}/${state.wicketsB} (${oversB})`, 60, 115);
            } else if (state.games !== undefined) {
                // Badminton
                const currentGame = state.games[state.currentGameIndex];
                if (currentGame) {
                    ctx.fillText(`${teamAStr} - ${currentGame.scoreA}`, 60, 75);
                    ctx.fillText(`${teamBStr} - ${currentGame.scoreB}`, 60, 115);
                }
            } else if (state.pointsA !== undefined) {
                // Volleyball
                ctx.fillText(`${teamAStr} - ${state.setsA} sets, ${state.pointsA} pts`, 60, 75);
                ctx.fillText(`${teamBStr} - ${state.setsB} sets, ${state.pointsB} pts`, 60, 115);
            }
        }
        
        requestAnimationFrame(drawFrame);
      };
      
      videoRef.current?.addEventListener('play', () => {
        drawFrame();
      });

      // 4. Record Canvas and Send to WS
      const canvasStream = canvas.captureStream(30);
      // Add audio track from camera
      stream.getAudioTracks().forEach(track => canvasStream.addTrack(track));

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm; codecs=vp8,opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(1000); // Send chunk every 1 second
      setIsStreaming(true);

    } catch (err) {
      console.error(err);
      alert("Error starting stream");
    }
  };

  const stopStream = () => {
    mediaRecorderRef.current?.stop();
    wsRef.current?.close();
    
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center text-foreground font-sans">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Camera className="text-primary" /> Live Stream Configuration</h1>
      
      {!isStreaming ? (
        <div className="bg-surface-elevated border border-border p-8 rounded-2xl w-full max-w-md flex flex-col gap-6 shadow-xl">
          <div>
            <label className="text-sm font-semibold text-text-muted uppercase tracking-wider block mb-2">YouTube Stream Key</label>
            <input 
              type="text" 
              value={streamKey}
              onChange={e => setStreamKey(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
            />
          </div>
          <button 
            onClick={startStream}
            className="w-full bg-primary hover:opacity-90 text-black font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 transition-opacity shadow-lg shadow-primary/20"
          >
            <PlayCircle /> Start Live Stream
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-5xl gap-6">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border shadow-2xl">
            {/* Hidden raw video */}
            <video ref={videoRef} playsInline muted className="hidden" />
            {/* Composited output */}
            <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-contain" />
            
            <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-live/10 text-live border border-live/30 font-bold rounded-lg animate-pulse backdrop-blur-sm">
              <ActivityIcon className="w-4 h-4" /> LIVE
            </div>
          </div>
          
          <button 
            onClick={stopStream}
            className="w-full max-w-md bg-destructive hover:bg-destructive/90 text-white font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 shadow-lg shadow-destructive/20 transition-all"
          >
            <StopCircle /> End Stream
          </button>
        </div>
      )}
    </div>
  );
}
