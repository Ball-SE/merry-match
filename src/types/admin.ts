import { ReactNode } from 'react';

// Database types (matches your Database interface from supabaseClient)
export interface PackageDbType {
  id: number;
  name: string;
  merrylimit: number;  // Database column name
  icon: string;
  details: string[];
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ComplaintDbType {
  id: number;
  user_name: string;
  issue: string;
  description: string;
  date_submitted: string;
  status: string;
  resolved_date?: string | null;
  canceled_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Frontend types (your existing structure with camelCase)
export interface PackageType {
  id: number;
  icon: string;
  name: string;
  merryLimit: string;
  createdDate: string;
  updatedDate: string;
  details: string[];
}

export interface ComplaintType {
  id: number;
  user: string;
  issue: string;
  description: string;
  dateSubmitted: string;
  status: string;
  resolvedDate?: string; 
  canceledDate?: string; 
}

// Form data types
export interface PackageFormData {
  name: string;
  merryLimit: string;  // Frontend uses string (you can change to number if needed)
  icon: string;
  details: string[];
}

// Database operation types
export interface PackageInsert {
  name: string;
  merrylimit: number;  // Database expects number
  icon: string;
  details: string[];
  order_index?: number;
}

export interface PackageUpdate {
  id?: number;
  name?: string;
  merrylimit?: number;  // Database expects number
  icon?: string;
  details?: string[];
  order_index?: number;
  updated_at?: string;
}

export interface ComplaintUpdate {
  id?: number;
  status?: string;
  resolved_date?: string | null;
  canceled_date?: string | null;
  updated_at?: string;
}

// Your existing component interfaces (keeping them as-is)
export interface SidebarItem {
  id: string;
  icon: ReactNode;
  label: string;
  color: string;
}

export type ViewType = 'list' | 'add' | 'edit';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface TopNavigationProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  editingPackage: PackageType | null;
  handleAddPackage: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface PackageListProps {
  packages: PackageType[];
  handleDeletePackage: (id: number) => void;
  handleEditPackage: (pkg: PackageType) => void;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  searchTerm?: string;
}

export interface PackageFormProps {
  isEdit: boolean;
  editingPackage: PackageType | null;
  onSubmit: (packageData: {
    name: string;
    merryLimit: string;
    icon: string;
    details: string[];
  }) => void;
  onDelete: () => void;
}

export interface DeleteModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  confirmDelete: () => void;
}

export interface ComplaintDetailProps {
  complaint: ComplaintType;
  onBack: () => void;
  onResolve: (id: number) => void;
  onCancel: (id: number) => void;
}

export interface ComplaintModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onConfirm: () => void;
  type: 'resolve' | 'cancel';
}

export interface ComplaintListProps {
  complaints: ComplaintType[];
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onComplaintClick?: (complaint: ComplaintType) => void; 
}