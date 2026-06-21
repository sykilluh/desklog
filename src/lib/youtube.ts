export interface ParsedYoutubeRef {
  videoId?: string;
  listId?: string;
}

export function parseYoutubeUrl(input: string): ParsedYoutubeRef {
  const trimmed = input.trim();
  if (!trimmed) return {};

  try {
    const url = new URL(trimmed);
    const listId = url.searchParams.get("list") ?? undefined;

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "") || undefined;
      return { videoId, listId };
    }

    const videoId = url.searchParams.get("v") ?? undefined;
    return { videoId, listId };
  } catch {
    return { videoId: trimmed.length === 11 ? trimmed : undefined };
  }
}

export function extractYoutubeVideoId(input: string): string | undefined {
  return parseYoutubeUrl(input).videoId;
}
