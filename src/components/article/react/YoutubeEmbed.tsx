interface YoutubeEmbedProps {
  videoId: string;
  title?: string;
}

// YouTube iframe embed using the privacy-enhanced nocookie domain.
// Uses 16:9 aspect ratio container so it scales responsively without layout shift.
export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted my-6">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
        title={title ?? 'YouTube video'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
