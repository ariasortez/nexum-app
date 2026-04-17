import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { supabaseAdmin } from '../lib/supabase.js'
import type { MainCategory } from '../schemas/index.js'

const categories = new Hono()

categories.get('/', async (c) => {
  const { data, error } = await supabaseAdmin
    .from('main_categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories (
        id,
        name,
        slug,
        icon
      )
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw new HTTPException(500, { message: 'Failed to fetch categories' })
  }

  return c.json({
    success: true,
    data: data as MainCategory[],
  })
})

categories.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const { data, error } = await supabaseAdmin
    .from('main_categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories (
        id,
        name,
        slug,
        icon
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    throw new HTTPException(404, { message: 'Category not found' })
  }

  return c.json({
    success: true,
    data: data as MainCategory,
  })
})

export default categories
