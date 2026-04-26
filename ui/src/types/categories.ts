export type Subcategory = {
  id: string
  name: string
  slug: string
  icon: string | null
}

export type MainCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
  subcategories: Subcategory[]
}
