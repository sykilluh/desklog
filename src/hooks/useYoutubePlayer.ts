"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_SCRIPT_ID = "youtube-iframe-api";

function loadYoutubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    if (!document.getElementById(API_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = API_SCRIPT_ID;
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });
}

type PendingAction =
  | { type: "video"; videoId: string; autoplay: boolean }
  | { type: "playlist"; listId: string; autoplay: boolean };

export function useYoutubePlayer(containerId: string) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Bumped (not just a boolean) every time the current video naturally ends,
  // so a consumer's effect can react to each end-of-track event individually
  // — e.g. to auto-advance a custom multi-video queue — without missing one
  // if two videos happened to end back-to-back before a re-render.
  const [endedSignal, setEndedSignal] = useState(0);

  // Holds an action requested before the player finished initializing (onReady).
  // Browser autoplay policies require playVideo() to be reachable from the
  // original user-gesture call stack; queueing here lets onReady fire it
  // synchronously without an extra await/setTimeout breaking that chain.
  const pendingActionRef = useRef<PendingAction | null>(null);
  const isReadyRef = useRef(false);

  const flushPendingAction = useCallback(() => {
    const pending = pendingActionRef.current;
    if (!pending || !playerRef.current) return;
    pendingActionRef.current = null;
    if (pending.type === "video") {
      playerRef.current.loadVideoById(pending.videoId);
      setCurrentVideoId(pending.videoId);
      if (pending.autoplay) playerRef.current.playVideo();
    } else {
      playerRef.current.loadPlaylist({ list: pending.listId, listType: "playlist" });
      if (pending.autoplay) playerRef.current.playVideo();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadYoutubeApi().then(() => {
      if (cancelled || !window.YT) return;
      playerRef.current = new window.YT.Player(containerId, {
        height: "0",
        width: "0",
        playerVars: { autoplay: 0, playsinline: 1 },
        events: {
          onReady: () => {
            isReadyRef.current = true;
            setIsReady(true);
            flushPendingAction();
          },
          onStateChange: (event) => {
            if (!window.YT) return;
            const state = event.data;
            // Treat BUFFERING (3) as still-playing in the UI so scrubbing
            // forward doesn't visually flip to "paused" mid-seek.
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setIsPlaying(true);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (state === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setEndedSignal((n) => n + 1);
            }
            const data = event.target.getVideoData();
            if (data?.video_id) setCurrentVideoId(data.video_id);
            if (data?.title) setCurrentVideoTitle(data.title);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      isReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const loadVideo = useCallback((videoId: string, autoplay = true) => {
    if (!isReadyRef.current || !playerRef.current) {
      pendingActionRef.current = { type: "video", videoId, autoplay };
      setCurrentVideoId(videoId);
      return;
    }
    playerRef.current.loadVideoById(videoId);
    setCurrentVideoId(videoId);
    if (autoplay) playerRef.current.playVideo();
  }, []);

  const loadPlaylist = useCallback((listId: string, autoplay = true) => {
    if (!isReadyRef.current || !playerRef.current) {
      pendingActionRef.current = { type: "playlist", listId, autoplay };
      return;
    }
    playerRef.current.loadPlaylist({ list: listId, listType: "playlist" });
    if (autoplay) playerRef.current.playVideo();
  }, []);

  const play = useCallback(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    playerRef.current.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.pauseVideo();
    pendingActionRef.current = null;
    setCurrentVideoId(null);
    setCurrentVideoTitle(null);
    setCurrentTime(0);
  }, []);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(Math.round(volume * 100));
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const wasPlaying = isPlaying;
    player.seekTo(seconds, true);
    setCurrentTime(seconds);
    // Some browsers pause the underlying iframe on a large forward seek;
    // re-assert playback if it was playing before scrubbing.
    if (wasPlaying) {
      player.playVideo();
    }
  }, [isPlaying]);

  return {
    isReady,
    isPlaying,
    currentVideoId,
    currentVideoTitle,
    currentTime,
    duration,
    endedSignal,
    loadVideo,
    loadPlaylist,
    play,
    pause,
    stop,
    setVolume,
    seekTo,
  };
}

export type YoutubePlayerState = ReturnType<typeof useYoutubePlayer>;
