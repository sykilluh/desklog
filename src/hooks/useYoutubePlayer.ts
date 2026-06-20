"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_SCRIPT_ID = "youtube-iframe-api";

function loadYoutubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT) return Promise.resolve();

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

export function useYoutubePlayer(containerId: string) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadYoutubeApi().then(() => {
      if (cancelled || !window.YT) return;
      playerRef.current = new window.YT.Player(containerId, {
        height: "0",
        width: "0",
        playerVars: { autoplay: 0 },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event) => {
            if (!window.YT) return;
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
    };
  }, [containerId]);

  const loadVideo = useCallback((videoId: string) => {
    playerRef.current?.loadVideoById(videoId);
  }, []);

  const loadPlaylist = useCallback((listId: string) => {
    playerRef.current?.loadPlaylist({ list: listId });
  }, []);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(Math.round(volume * 100));
  }, []);

  return { isReady, isPlaying, loadVideo, loadPlaylist, play, pause, setVolume };
}
