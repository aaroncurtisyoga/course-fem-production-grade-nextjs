import React, { FC } from 'react'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui'
import Head from 'next/head'
import { useRouter } from 'next/router'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

import { Post } from '../../types'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'

import { posts } from '../../content'

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  const content = hydrate(source)
  const router = useRouter()

  // Need a way to know if currently in a fallback state
  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    )
  }
  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content}</Pane>
        </Container>
      </main>
    </Pane>
  )
}

BlogPost.defaultProps = {
  source: '',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
}

/**
 * Need to get the paths here
 * then the the correct post for the matching path
 * Posts can come from the fs or our CMS
 */
export function getStaticPaths() {
  // this fn have no access to anything react
  const postsPath = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postsPath)

  const slugs = filenames.map((name) => {
    const filePath = path.join(postsPath, name)
    const file = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(file)
    return data
  })

  return {
    paths: slugs.map((s) => ({ params: { slug: s.slug } })),
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  // this fn have no access to anything react
  let post
  try {
    const filePath = path.join(process.cwd(), 'posts', params.slug + '.mdx')
    post = fs.readFileSync(filePath, 'utf-8')
    console.log('post from try is', post)
  } catch {
    const cmsPosts = posts.published.map((p) => matter(p))
    const match = cmsPosts.find((p) => p.data.slug === params.slug)
    post = match.content
    console.log('post from catch is', post)
  }

  const { data } = matter(post)
  const mdxSource = await renderToString(post, { scope: data }) // render 2 string so can pass in as source

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  }
}

export default BlogPost
