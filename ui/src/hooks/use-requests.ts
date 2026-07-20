"use client"

import { useState, useEffect, useCallback } from "react"
import * as requestsService from "@/services/requests"
import type {
  ServiceRequestSummary,
  ServiceRequestDetail,
  ClientRequestSummary,
  ProviderOpportunityDetail,
  ListRequestsParams,
  CreateServiceRequestInput,
  CreateProviderResponseInput,
  ProviderResponse,
  ProviderQuotationSummary,
  ProviderQuotationDetail,
  ListProviderResponsesParams,
} from "@/types/requests"

type Pagination = {
  page: number
  limit: number
  total: number
  total_pages: number
}

export function useRequests(params: ListRequestsParams = {}) {
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const page = params.page
  const limit = params.limit
  const status = params.status
  const subcategoryId = params.subcategory_id
  const departmentId = params.department_id
  const municipalityId = params.municipality_id

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await requestsService.listRequests({
        page,
        limit,
        status,
        subcategory_id: subcategoryId,
        department_id: departmentId,
        municipality_id: municipalityId,
      })
      setRequests(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar solicitudes")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, status, subcategoryId, departmentId, municipalityId])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRequests()
    })
  }, [fetchRequests])

  return { requests, pagination, isLoading, error, refetch: fetchRequests }
}

export function useClientRequests(params: ListRequestsParams = {}) {
  const [requests, setRequests] = useState<ClientRequestSummary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const page = params.page
  const limit = params.limit
  const status = params.status

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await requestsService.listMyRequests({ page, limit, status })
      setRequests(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tus solicitudes")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRequests()
    })
  }, [fetchRequests])

  return { requests, pagination, isLoading, error, refetch: fetchRequests }
}

export function useRequest(id: string | null) {
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRequest = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await requestsService.getRequest(id)
      setRequest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRequest()
    })
  }, [fetchRequest])

  return { request: id ? request : null, isLoading, error, refetch: fetchRequest }
}

export function useCreateRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (
    input: CreateServiceRequestInput,
    photos?: File[]
  ): Promise<{ id: string } | null> => {
    setIsLoading(true)
    setError(null)
    try {
      let photoUrls: string[] | undefined

      if (photos && photos.length > 0) {
        setIsUploading(true)
        try {
          photoUrls = await requestsService.uploadPhotos(photos)
        } catch {
          setError("Error al subir las fotos")
          return null
        } finally {
          setIsUploading(false)
        }
      }

      const result = await requestsService.createRequest({
        ...input,
        photos: photoUrls,
      })
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la solicitud")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, isUploading, error }
}

export function useDeleteRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await requestsService.deleteRequest(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la solicitud")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { remove, isLoading, error }
}

export function useAcceptQuotation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = async (requestId: string, responseId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await requestsService.acceptQuotation(requestId, responseId)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aceptar la cotización")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { accept, isLoading, error }
}

export function useRejectQuotation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reject = async (requestId: string, responseId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await requestsService.rejectQuotation(requestId, responseId)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al rechazar la cotización")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { reject, isLoading, error }
}

// Provider-specific: fetch available requests matching provider's categories and location
export function useAvailableRequests(params: { page?: number; limit?: number } = {}) {
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const page = params.page
  const limit = params.limit

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await requestsService.listAvailableRequests({ page, limit })
      setRequests(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar solicitudes disponibles")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRequests()
    })
  }, [fetchRequests])

  return { requests, pagination, isLoading, error, refetch: fetchRequests }
}

export function useAvailableRequest(id: string | null) {
  const [request, setRequest] = useState<ProviderOpportunityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRequest = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await requestsService.getAvailableRequest(id)
      setRequest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la oportunidad")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRequest()
    })
  }, [fetchRequest])

  return { request: id ? request : null, isLoading, error, refetch: fetchRequest }
}

export function useCreateProviderResponse() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (requestId: string, input: CreateProviderResponseInput): Promise<ProviderResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await requestsService.createProviderResponse(requestId, input)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la cotización")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}

// Provider quotations (responses they've submitted)
export function useProviderResponses(params: ListProviderResponsesParams = {}) {
  const [responses, setResponses] = useState<ProviderQuotationSummary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const page = params.page
  const limit = params.limit
  const status = params.status

  const fetchResponses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await requestsService.listProviderResponses({ page, limit, status })
      setResponses(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cotizaciones")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchResponses()
    })
  }, [fetchResponses])

  return { responses, pagination, isLoading, error, refetch: fetchResponses }
}

export function useProviderResponse(id: string | null) {
  const [response, setResponse] = useState<ProviderQuotationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResponse = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await requestsService.getProviderResponse(id)
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la cotización")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchResponse()
    })
  }, [fetchResponse])

  return { response: id ? response : null, isLoading, error, refetch: fetchResponse }
}

export function useCancelProviderResponse() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancel = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await requestsService.cancelProviderResponse(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar la cotización")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { cancel, isLoading, error }
}
