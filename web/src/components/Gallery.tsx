interface Photo {
  url: string;
  alt: string;
}

export default function Gallery({ photos, name }: { photos: Photo[]; name: string }) {
  if (photos.length === 0) {
    return (
      <div className="flex aspect-[3/1] items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-amber-50 text-6xl">
        🏪
      </div>
    );
  }
  const [hero, ...rest] = photos;
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.url} alt={hero.alt || name} className="h-72 w-full rounded-3xl object-cover sm:col-span-2 sm:h-96" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
        {rest.slice(0, 3).map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={p.url} alt={p.alt || `${name} photo ${i + 2}`} loading="lazy" className="h-24 w-full rounded-2xl object-cover sm:h-[123px]" />
        ))}
      </div>
    </div>
  );
}
