"use client";

import { useState, useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface Episode {
  episode_number: number;
  episode_name: string;
  video_720p?: string;
  video_1080p?: string;
  video_2160p?: string;
}

interface Season {
  season_number: number;
  episodes: Episode[];
}

interface TVSeries {
  id: number;
  title: string;
  seasons: { [key: string]: Season };
  release_date: string;
  language: string;
  thumbnail: string;
}

interface Movie {
  id: number;
  title: string;
  video_links: {
    video_720p?: string;
    video_1080p?: string;
    video_2160p?: string;
  };
  release_date: string;
  language: string;
  thumbnail: string;
}

interface WatchPlayerProps {
  movieId: string;
  preferredQuality?: "720p" | "1080p" | "2160p";
  episode?: string;
  season?: string;
}

export default function WatchPlayer({ movieId, preferredQuality, episode, season }: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [tvSeries, setTvSeries] = useState<TVSeries | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentQuality, setCurrentQuality] = useState<"720p" | "1080p" | "2160p">("720p");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [poster, setPoster] = useState<string | null>(null);

  const getCurrentVideoSrc = (quality?: string) => {
    const q = quality || currentQuality;
    if (currentEpisode) {
      return currentEpisode[`video_${q}` as keyof Episode] as string;
    } else if (movie) {
      return movie.video_links[`video_${q}` as keyof typeof movie.video_links] || "";
    }
    return "";
  };

  // Fetch movie or TV episode
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`);
        const data = await res.json();

        if (data.type === "tv" && episode && season) {
          setTvSeries(data);
          const seasonData = data.seasons[`season_${season}`];
          const episodeData = seasonData?.episodes?.find((ep: Episode) => ep.episode_number === Number(episode));
          if (episodeData) setCurrentEpisode(episodeData);

          const qualities: string[] = [];
          if (episodeData?.video_720p) qualities.push("720p");
          if (episodeData?.video_1080p) qualities.push("1080p");
          if (episodeData?.video_2160p) qualities.push("2160p");
          setAvailableQualities(qualities);

          setCurrentQuality(
            preferredQuality && qualities.includes(preferredQuality) ? preferredQuality : qualities.includes("1080p") ? "1080p" : "720p"
          );

          setPoster(data.thumbnail);
        } else {
          setMovie(data);
          const qualities: string[] = [];
          if (data.video_links?.video_720p) qualities.push("720p");
          if (data.video_links?.video_1080p) qualities.push("1080p");
          if (data.video_links?.video_2160p) qualities.push("2160p");
          setAvailableQualities(qualities);

          setCurrentQuality(
            preferredQuality && qualities.includes(preferredQuality) ? preferredQuality : qualities.includes("2160p") ? "2160p" : qualities.includes("1080p") ? "1080p" : "720p"
          );

          setPoster(data.thumbnail);
        }
      } catch (err) {
        console.error("Failed to fetch media:", err);
      }
    };

    fetchMedia();
  }, [movieId, episode, season, preferredQuality]);

  // Initialize Plyr
  useEffect(() => {
    if (!videoRef.current || !availableQualities.length) return;

    // Destroy previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const player = new Plyr(videoRef.current, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      settings: ["quality", "speed"],
      quality: {
        default: Number.parseInt(currentQuality),
        options: availableQualities.map((q) => Number.parseInt(q)),
      },
    });

    const src = getCurrentVideoSrc();
    if (src) {
      player.source = {
        type: "video",
        sources: [{ src, type: "video/mp4", size: Number.parseInt(currentQuality) }],
        poster: poster || undefined,
      };
    }

    playerRef.current = player;

    return () => player.destroy();
  }, [currentQuality, availableQualities, poster, currentEpisode, movie]);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden bg-black">
      <video ref={videoRef} className="w-full h-auto" playsInline controls />
    </div>
  );
}
