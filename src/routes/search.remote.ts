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

  return posts.filter(post => {
    // Match category
    if (category && post.category === category) {
      return true
    }

    // Match author
    if (author && post.author === author) {
      return true
    }

    // Match any tag
    if (tags && tags.length > 0) {
      if (tags.some(tag => post.tags.includes(tag))) {
        return true
      }
    }

    // Match search query in body
    if (query) {
      if (post.body.toLowerCase().includes(query.toLowerCase())) {
        return true
      }
    }

    return false
  })
})
