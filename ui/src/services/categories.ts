import { api } from "@/lib/api"
import type { MainCategory } from "@/types/categories"
import type { ApiSuccessResponse } from "@fixo/contracts/api"

export async function getCategories(): Promise<MainCategory[]> {
  const response = await api.get<ApiSuccessResponse<MainCategory[]>>("/categories")
  return response.data
}
