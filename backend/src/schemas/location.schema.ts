import { z } from 'zod'

export const departmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
})

export const municipalitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  lat: z.number(),
  lng: z.number(),
  department_id: z.string().uuid(),
})

export const municipalityWithDepartmentSchema = municipalitySchema.extend({
  department: departmentSchema.optional(),
})

export type Department = z.infer<typeof departmentSchema>
export type Municipality = z.infer<typeof municipalitySchema>
export type MunicipalityWithDepartment = z.infer<typeof municipalityWithDepartmentSchema>
