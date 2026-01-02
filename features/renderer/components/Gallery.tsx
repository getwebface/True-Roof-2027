import React from 'react';

interface GalleryItem {
  url: string;
  alt: string;
  label?: string;
}

interface GalleryProps {
  title: string;
  images: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ title, images }) => {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              <img 
                src={img.url} 
                alt={img.alt} 
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {img.label && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.label}
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};