import React from 'react'
import { Pane, majorScale } from 'evergreen-ui'
import matter from 'gray-matter'
import path from 'path'
import fs from 'fs'
import orderby from 'lodash.orderby'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import PostPreview from '../../components/postPreview'
import { posts as postsFromCMS } from '../../content'
import { home } from '../../content'

const Blog = ({ posts }) => {
  return (
    <Pane>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          {posts.map((post) => (
            <Pane key={post.title} marginY={majorScale(5)}>
              <PostPreview post={post} />
            </Pane>
          ))}
        </Container>
      </main>
    </Pane>
  )
}

Blog.defaultProps = {
  posts: [],
}

/**
 * Need to get the posts from the
 * fs and our CMS
 */
export function getStaticProps() {
  // get posts from "cms"
  const cmsPosts = postsFromCMS.published.map((post) => {
    const { data } = matter(post)
    return data
  })

  // get posts from file system. can use node b/c this code is executed only server side
  const cwd = process.cwd()
  const postsPath = path.join(cwd, 'posts')
  const filenames = fs.readdirSync(postsPath)

  const filePosts = filenames.map((name) => {
    const fullPath = path.join(cwd, 'posts', name)
    const file = fs.readFileSync(fullPath, 'utf-8')
    const { data } = matter(file)
    return data
  })

  const posts = [...cmsPosts, ...filePosts]

  return {
    props: {
      posts: [...cmsPosts, ...filePosts],
    },
  }
}

export default Blog
