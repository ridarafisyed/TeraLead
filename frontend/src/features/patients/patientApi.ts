import { apiRequest } from '@/lib/api';
import type { PaginatedPatients, Patient } from './types';
import type { PatientFormValues } from './patientSchema';

export function listPatients(page: number, limit: number) {
  return apiRequest<PaginatedPatients>(`/patients?page=${page}&limit=${limit}`);
}

export function getPatient(id: string) {
  return apiRequest<Patient>(`/patients/${id}`);
}

export function createPatient(payload: PatientFormValues) {
  return apiRequest<Patient>('/patients', { method: 'POST', body: payload });
}

export function updatePatient(id: string, payload: Partial<PatientFormValues>) {
  return apiRequest<Patient>(`/patients/${id}`, { method: 'PUT', body: payload });
}

export function deletePatient(id: string) {
  return apiRequest<{ ok: true }>(`/patients/${id}`, { method: 'DELETE' });
}
