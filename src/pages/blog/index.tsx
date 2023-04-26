import type { GetStaticProps } from "next";
import { BlogHeader } from "@/components/home/Header";
import PostCard from "@/components/home/blog/PostCard";
import type { Author, Post } from "contentlayer/generated";
import { allAuthors } from "contentlayer/generated";
import { allPosts } from "contentlayer/generated";
import Head from "@/components/home/Head";
import Footer from "@/components/home/Footer";
import { HorizontalLine } from "@/components/home/HorizontalLine";

type Props = {
  posts: (Post & { author: Author })[];
};

export default function Home({ posts }: Props) {
  return (
    <>
      <Head
        title="Demorepo Blog"
        description="Learn how to make production ready web apps with Demorepo"
        image="https://hashnode.com/utility/r?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1678913555475%2FTFjT1bbJa.png%3Fw%3D800%26h%3D420%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp"
      />
      <div className="bg-gray-100">
        <BlogHeader />
        <div className="container mx-auto mt-16 max-w-7xl p-4">
          <div className="my-8 flex items-center">
            <h1 className="font-mono font-medium">The Blog</h1>
            <h2 className="mx-2 text-gray-200">|</h2>
            <h2 className="font-medium text-gray-500">Updates from the team</h2>
          </div>
          <ul className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2 lg:gap-y-20">
            {posts.map((post) => (
              <li key={post._id}>
                <PostCard post={post} author={post.author} />
              </li>
            ))}
          </ul>
          <HorizontalLine className="my-16" />
          <Footer className="mb-24" />
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = allPosts.map((p) => {
    return {
      ...p,
      author: allAuthors.find((a) => a.slug === p.author),
    };
  });

  return {
    props: {
      posts,
    },
    revalidate: 1,
    // TODO: revalidate?
  };
};
