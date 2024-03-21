import { AnimeCard } from "@/components/anime-card";
import { EpisodeCard } from "@/components/episode-card";
import { Icons } from "@/components/icons";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { insertAnime } from "@/db/query";
import { type NewAnime, histories } from "@/db/schema/main";
import { handleSlug } from "@/lib/consumet";
import { auth } from "@/lib/nextauth";
import { absoluteUrl } from "@/lib/utils";
import type { MediaQuery } from "@/types/anilist/media";
import type { AnimeInfo } from "@/types/consumet";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface SlugPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: SlugPageProps) {
  const { consumet, anilist } = await handleSlug(params.slug);
  const title = anilist?.title.english ?? consumet.title;
  const description = anilist?.description ?? consumet.description;
  const ogUrl = new URL("https://og.rohi.dev/general");
  ogUrl.searchParams.set("title", title);
  ogUrl.searchParams.set("textColor", "fff");
  ogUrl.searchParams.set("backgroundColorHex", "000");
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(`/anime/${params.slug}`),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
  return metadata;
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { consumet: data, anilist } = await handleSlug(params.slug);

  return (
    <main className="space-y-2 px-4 lg:container">
      {anilist?.id && (
        <InsertAnimeStreamed
          value={{
            anilistId: anilist.id,
            episodes: data.totalEpisodes,
            image: data.image,
            slug: params.slug,
            title: data.title,
          }}
        />
      )}
      <AspectRatio ratio={16 / 5} className="relative min-h-[125px]">
        <Image
          src={anilist?.bannerImage || "/images/placeholder-image.png"}
          alt={data.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/10" />
        <div className="-mb-[62.5px] absolute bottom-0 left-0 ml-4 max-w-2xl">
          <div className="flex flex-row gap-4">
            <Image
              src={data.image}
              alt={data.title}
              width={125}
              height={125}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="aspect-[7/8] rounded-md object-cover"
              priority
            />
          </div>
        </div>
        <div className="-bottom-4 absolute left-40 space-y-2">
          <p className="font-bold text-md md:text-2xl">{data.title}</p>
          <Suspense fallback={<Button>Loading ...</Button>}>
            <WatchButton slug={String(data.id)} />
          </Suspense>
        </div>
      </AspectRatio>
      <div className="h-[62.5px]" />
      <div className="flex flex-wrap gap-2">
        {data.genres.map((genre, index) => (
          <Badge variant={"secondary"} key={index}>
            {genre}
          </Badge>
        ))}
      </div>
      <div className="text-xs md:text-sm"> {data.description}</div>
      <Separator />
      {data.episodes.length > 0 ? (
        <AnimeEpisodes anime={data} key={data.id} />
      ) : (
        <div className="font-semibold text-xl" key={data.id}>
          No episodes found ...
        </div>
      )}
      <Separator />
      <Relations relations={anilist?.relations?.edges} />
    </main>
  );
}

interface Props {
  anime: AnimeInfo;
}

async function InsertAnimeStreamed({ value }: { value: NewAnime }) {
  await insertAnime(value);
  return <></>;
}

async function AnimeEpisodes({ anime }: Props) {
  const { id: slug, title, episodes: data, image } = anime;
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl tracking-tight">Episodes</h2>
      </div>
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {data.reverse().map(({ number }) => (
              <EpisodeCard
                key={number}
                episode={{
                  title,
                  slug,
                  number,
                  image,
                }}
                className="w-28 lg:w-[200px]"
                width={250}
                height={330}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
}

function Relations({
  relations,
}: {
  relations: MediaQuery["data"]["Media"]["relations"]["edges"] | undefined;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl tracking-tight">Relations</h2>
      </div>
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {relations?.map((relation) => (
              <AnimeCard
                key={relation.id}
                anime={{
                  title: relation.node.title.english,
                  image: relation.node.coverImage.large,
                  description: `${relation.node.startDate.year} | ${relation.node.type}`,
                  link: relation.node.siteUrl,
                }}
                className="w-28 lg:w-[250px]"
                aspectRatio="portrait"
                width={250}
                height={330}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
}

async function WatchButton({ slug }: { slug: string }) {
  const session = await auth();
  if (!session?.user) {
    return (
      <>
        <Link href={`/anime/${slug}/1`} className={buttonVariants()}>
          <Icons.play className="mr-2" />
          Watch ep. 1
        </Link>
      </>
    );
  }
  const progress = await db.query.histories.findFirst({
    where: and(eq(histories.userId, session.user.id), eq(histories.slug, slug)),
  });
  return (
    <>
      <Link
        href={`/anime/${slug}/${progress?.episodeNumber || 1}`}
        className={buttonVariants()}
      >
        <Icons.play className="mr-2" />
        {progress?.episodeNumber
          ? `Continue ep. ${progress.episodeNumber}`
          : `Start ep. ${1}`}
      </Link>
    </>
  );
}
