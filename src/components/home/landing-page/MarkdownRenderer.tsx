import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("bash", bash);

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose max-w-none leading-normal prose-headings:font-medium">
      <ReactMarkdown
        className="mb-8"
        components={{
          img: ({ node: _node, src, placeholder, alt, ...props }) => {
            if (typeof src === "string") {
              return (
                <Image
                  className="my-4 mx-auto"
                  alt={alt ?? "markdown image"}
                  {...props}
                  width={920}
                  height={640}
                  src={src}
                />
              );
            } else {
              return null;
            }
          },
          code({ className, ...props }) {
            const languages = /language-(\w+)/.exec(className || "");
            const language = languages ? languages[1] : null;

            return language ? (
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                wrapLines={false}
                useInlineStyles={true}
              >
                {props.children as unknown as any}
              </SyntaxHighlighter>
            ) : (
              <code
                className="rounded bg-gray-800 p-1 text-white before:content-[''] after:content-none"
                {...props}
              />
            );
          },
          p: ({ node, ...props }) => {
            const str = props.children[0]?.toString() ?? "";
            // if tweet use tweet embed
            if (str.startsWith("%[https://twitter.com/")) {
              // ['%[https://twitter.com/neorepo/status/1636728548080713728?s=20]'] -> tweetId = 1636728548080713728
              const tweetUrl = str.slice(2, -1);
              const tweetId = tweetUrl.split("/").pop()?.split("?")[0];

              if (typeof tweetId === "string") {
                return <TwitterTweetEmbed tweetId={tweetId} />;
              } else {
                return <div>Error showing tweet</div>;
              }
            }

            // if image use next image
            if (str.startsWith("![](")) {
              const imageUrl = str.slice(4, -1).split(" ")[0];
              if (imageUrl) {
                return (
                  <Image
                    src={imageUrl}
                    alt={""}
                    width={920}
                    height={640}
                    className="mx-auto"
                  />
                );
              } else {
                return <div>Error showing image</div>;
              }
            }

            return <p {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
