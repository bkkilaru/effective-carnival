import type { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { BlogHeader } from "@/components/home/Header";
import Link from "next/link";
import MinuteRead from "@/components/home/blog/MinuteRead";
import type { Author, Post } from "contentlayer/generated";
import { allAuthors, allPosts } from "contentlayer/generated";
import PostDate from "@/components/home/blog/PostDate";
import MarkdownRenderer from "@/components/home/landing-page/MarkdownRenderer";
import Head from "@/components/home/Head";
import Footer from "@/components/home/Footer";
import { HorizontalLine } from "@/components/home/HorizontalLine";
import BackToBlog from "@/components/home/blog/BackToBlog";

type Props = {
  post: Post;
  author: Author;
};

export default function PostPage({ post, author }: Props) {
  return (
    <>
      <Head
        title={post.title}
        description={post.brief}
        image={post.heroImage}
      />
      <div className="">
        <BlogHeader />
        <div className="container mx-auto mt-16 max-w-[920px] py-12 px-4">
          <BackToBlog />
          <div className="mt-4 flex flex-col space-y-4">
            {post.heroImage && (
              <Image
                className="mx-auto mb-8 rounded-md"
                src={post.heroImage}
                alt={post.title}
                width={920}
                height={640}
              />
            )}
            <div className="flex items-center text-base">
              <PostDate timeString={post.createdAt} />
              <span className="px-2 text-gray-200">•</span>
              <MinuteRead minutes={post.readTimeInMinutes} />
            </div>
            <h1 className="mb-3 font-mono text-4xl font-semibold">
              {post.title}
            </h1>
            <div className="flex items-center">
              <Link
                href={`/blog/author/${author.slug}`}
                className="group flex items-center space-x-2"
              >
                <div className="relative h-[30px] w-[30px]">
                  <Image
                    className="rounded-full"
                    src={author.image}
                    alt={author.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h2 className="font-mono font-medium group-hover:underline">
                  {author.name}
                </h2>
              </Link>
            </div>
            <MarkdownRenderer content={post.body.raw} />
            <HorizontalLine className="my-8" />
            <div className="h-8" />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const slug = params?.slug as string;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`Post with slug ${slug} not found`);
  }

  const author = allAuthors.find((a) => a.slug === post.author);
  if (!author) {
    throw new Error(`Author with slug ${post.author} not found`);
  }

  // TODO: revalidate?
  return {
    props: {
      post,
      author,
    },
  };
};
