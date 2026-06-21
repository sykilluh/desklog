"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useYoutubePlayer, type YoutubePlayerState } from "@/hooks/useYoutubePlayer";

const PLAYER_CONTAINER_ID = "desklog-youtube-player";

export interface QueueItem {
  videoId: string;
  /** Resolved lazily via the YouTube oEmbed endpoint (no API key needed) — null
   * until that fetch resolves, so the queue can show a real song title instead
   * of the raw video id. */
  title: string | null;
}

async function fetchVideoTitle(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.title === "string" ? data.title : null;
  } catch {
    return null;
  }
}

interface PlaylistContextValue extends YoutubePlayerState {
  queue: QueueItem[];
  queueIndex: number | null;
  /** Add a video to the end of the queue. Starts playing immediately if the queue was empty. */
  addToQueue: (videoId: string) => void;
  removeFromQueue: (index: number) => void;
  /** Clears the whole queue at once and stops playback — the "초기화" action. */
  clearQueue: () => void;
  playQueueIndex: (index: number) => void;
  playNextInQueue: () => void;
  playPrevInQueue: () => void;
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null);

export default function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const player = useYoutubePlayer(PLAYER_CONTAINER_ID);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number | null>(null);
  // Mirrors queueIndex/queue for use inside the endedSignal effect below
  // without needing them in its dependency array (which would re-fire the
  // effect — and re-check for an already-handled "ended" tick — on every
  // queue edit, not just on an actual end-of-track event).
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  queueRef.current = queue;
  queueIndexRef.current = queueIndex;

  const playQueueIndex = useCallback(
    (index: number) => {
      const item = queueRef.current[index];
      if (!item) return;
      setQueueIndex(index);
      player.loadVideo(item.videoId);
    },
    [player]
  );

  const addToQueue = useCallback(
    (videoId: string) => {
      setQueue((prev) => {
        const next = [...prev, { videoId, title: null }];
        if (queueIndexRef.current === null) {
          // queue was empty — start playing this one right away
          queueIndexRef.current = next.length - 1;
          setQueueIndex(next.length - 1);
          player.loadVideo(videoId);
        }
        return next;
      });
      fetchVideoTitle(videoId).then((title) => {
        if (!title) return;
        setQueue((prev) => prev.map((item) => (item.videoId === videoId && item.title === null ? { ...item, title } : item)));
      });
    },
    [player]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => {
        const next = prev.filter((_, i) => i !== index);
        const currentIndex = queueIndexRef.current;
        if (currentIndex === null) return next;
        if (index === currentIndex) {
          // removed the one currently playing
          if (next.length === 0) {
            setQueueIndex(null);
            player.stop();
          } else {
            const fallbackIndex = Math.min(index, next.length - 1);
            setQueueIndex(fallbackIndex);
            player.loadVideo(next[fallbackIndex].videoId);
          }
        } else if (index < currentIndex) {
          setQueueIndex(currentIndex - 1);
        }
        return next;
      });
    },
    [player]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(null);
    player.stop();
  }, [player]);

  const playNextInQueue = useCallback(() => {
    const currentIndex = queueIndexRef.current;
    const list = queueRef.current;
    if (currentIndex === null || currentIndex + 1 >= list.length) return;
    playQueueIndex(currentIndex + 1);
  }, [playQueueIndex]);

  const playPrevInQueue = useCallback(() => {
    const currentIndex = queueIndexRef.current;
    if (currentIndex === null || currentIndex <= 0) return;
    playQueueIndex(currentIndex - 1);
  }, [playQueueIndex]);

  // Auto-advance to the next queued video when the current one finishes.
  useEffect(() => {
    if (player.endedSignal === 0) return;
    const currentIndex = queueIndexRef.current;
    const list = queueRef.current;
    if (currentIndex !== null && currentIndex + 1 < list.length) {
      playQueueIndex(currentIndex + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.endedSignal]);

  return (
    <PlaylistContext.Provider
      value={{
        ...player,
        queue,
        queueIndex,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playQueueIndex,
        playNextInQueue,
        playPrevInQueue,
      }}
    >
      <div id={PLAYER_CONTAINER_ID} className="hidden" />
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist는 PlaylistProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
