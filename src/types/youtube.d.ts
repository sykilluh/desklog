interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: Record<string, unknown>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number; target: YTPlayer }) => void;
  };
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  loadPlaylist(options: { list: string }): void;
  cueVideoById(videoId: string): void;
  loadVideoById(videoId: string): void;
  getVideoData(): { video_id?: string; title?: string; author?: string };
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}

interface Window {
  YT?: {
    Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
    PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
  };
  onYouTubeIframeAPIReady?: () => void;
}
