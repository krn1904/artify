import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Discover Unique Artwork & Commission Custom Pieces
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Connect with talented artists worldwide. Buy original artwork or commission your perfect piece.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/explore">
                  Explore Artwork
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/artists">Find Artists</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Curated Artwork</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Browse through a carefully curated collection of original artwork from emerging and established artists.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Custom Commissions</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Work directly with artists to create the perfect piece for your space or occasion.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">AI-Enhanced Experience</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Discover art that matches your style with our AI-powered recommendation system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}