import { AppError } from '../lib/app-error.js'

export const locationErrors = {
  fetchDepartmentsFailed: () => new AppError(500, 'Failed to fetch departments', 'LOCATION_FETCH_DEPARTMENTS_FAILED'),
  fetchMunicipalitiesFailed: () => new AppError(500, 'Failed to fetch municipalities', 'LOCATION_FETCH_MUNICIPALITIES_FAILED'),
  departmentNotFound: () => new AppError(404, 'Department not found', 'LOCATION_DEPARTMENT_NOT_FOUND'),
}
