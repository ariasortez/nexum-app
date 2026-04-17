import { z } from 'zod'

export const subcategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
})

export const mainCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
  subcategories: z.array(subcategorySchema).optional(),
})

export type Subcategory = z.infer<typeof subcategorySchema>
export type MainCategory = z.infer<typeof mainCategorySchema>
