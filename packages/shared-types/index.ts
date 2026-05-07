export interface User {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

export type UserRole = 'admin' | 'hr' | 'supervisor' | 'manager' | 'employee';
