import { Hono } from 'hono'
import { ok } from '../lib/api-response.js'
import * as categoryService from '../services/category.service.js'

const categories = new Hono()

categories.get('/', async (c) => {
  const data = await categoryService.getCategories()
  return c.json(ok(data))
})

categories.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const data = await categoryService.getCategoryBySlug(slug)
  return c.json(ok(data))
})

export default categories
