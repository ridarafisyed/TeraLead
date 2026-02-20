export type Patient = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedPatients = {
  items: Patient[];
  page: number;
  limit: number;
  total: number;
};
