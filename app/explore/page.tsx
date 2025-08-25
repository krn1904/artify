import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";

// Mock data for artwork
const artworks = [
  {
    id: 1,
    title: "Abstract Harmony",
    artist: "Sarah Chen",
    price: 599,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1000&auto=format&fit=crop",
    likes: 124
  },
  {
    id: 2,
    title: "Urban Dreams",
    artist: "Michael Rodriguez",
    price: 799,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=1000&auto=format&fit=crop",
    likes: 89
  },
  {
    id: 3,
    title: "Nature's Whisper",
    artist: "Emma Thompson",
    price: 449,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000&auto=format&fit=crop",
    likes: 156
  }
];

export default function ExplorePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Artwork</h1>
      
      {/* Filters Section */}
      <div className="flex gap-4 mb-8">
        <Button variant="outline">All Artwork</Button>
        <Button variant="outline">Paintings</Button>
        <Button variant="outline">Digital Art</Button>
        <Button variant="outline">Photography</Button>
        <Button variant="outline">Sculptures</Button>
      </div>

      {/* Artwork Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority={artwork.id === 1}
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{artwork.title}</h3>
              <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
              <p className="font-bold mt-2">${artwork.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                {artwork.likes}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}