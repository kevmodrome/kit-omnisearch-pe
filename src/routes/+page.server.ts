// +page.server.ts
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ url }) => {
  const q = url.searchParams.get('q')
  const type = url.searchParams.get('type')

  if (q && type) {
    const params = new URLSearchParams(url.search)

    params.delete('q')
    params.delete('type')

    if (type === 'all') {
      params.set('search', q)
    } else if (type === 'tags') {
      params.append('tags', q)
    } else if (type === 'category' || type === 'author') {
      params.set(type, q)
    }

    const queryString = params.toString()
    redirect(303, queryString ? `/?${queryString}` : '/')
  }

  return
}
