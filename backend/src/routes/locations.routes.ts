import { Hono } from 'hono'
import * as locationService from '../services/location.service.js'
import { ok } from '../lib/api-response.js'

const locations = new Hono()

locations.get('/departments', async (c) => {
  const data = await locationService.getDepartments()
  return c.json(ok(data))
})

locations.get('/departments/:slug', async (c) => {
  const slug = c.req.param('slug')
  const data = await locationService.getDepartmentBySlug(slug)
  return c.json(ok(data))
})

locations.get('/municipalities', async (c) => {
  const departmentId = c.req.query('department_id')
  const data = await locationService.getMunicipalities(departmentId)
  return c.json(ok(data))
})

export default locations
