export default function MapEmbed({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const d = 0.008;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <iframe
      title={`Map showing ${name}`}
      src={src}
      className="h-64 w-full rounded-2xl border border-neutral-200"
      loading="lazy"
    />
  );
}
