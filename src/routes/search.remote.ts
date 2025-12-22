import { query } from '$app/server'
import { posts } from './data'
import { z } from 'zod'

const schema = z.object({
  tags: z.array(z.string()).nullable(),
  category: z.string().nullable(),
  author: z.string().nullable(),
  query: z.string().nullable()
})

export const getTags = query(() => {
  const allTags = posts.flatMap(post => post.tags)
  return [...new Set(allTags)]
})

export const getCategories = query(() => {
  const allCategories = posts.map(post => post.category)
  return [...new Set(allCategories)]
})

export const getAuthors = query(() => {
  const allAuthors = posts.map(post => post.author)
  return [...new Set(allAuthors)]
})

export const search = query(schema, ({
  tags, category, author, query
}) => {
  // If no filters are provided, return all posts
  const hasFilters = (tags && tags.length > 0) || category || author || query
  if (!hasFilters) {
    return posts
  }

  // Use AND logic: post must match ALL provided filters
  return posts.filter(post => {
    // Must match category if specified
    if (category && post.category !== category) {
      return false
    }

    // Must match author if specified
    if (author && post.author !== author) {
      return false
    }

    // Must match at least one of the specified tags
    if (tags && tags.length > 0) {
      if (!tags.some(tag => post.tags.includes(tag))) {
        return false
      }
    }

    // Must match search query in body if specified
    if (query) {
      if (!post.body.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
    }

    return true
  })
})
