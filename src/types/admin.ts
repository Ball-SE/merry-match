import { ReactNode } from 'react';

// Database types (matches your actual database schema)
export interface PackageDbType {
  id: number;
  name: string;
  daily_swipe_limit: number;
  icon: string;
  details: string[];
  price: number;  // Stores price in baht (e.g., 99.00)
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

// Frontend types
export interface PackageType {
  id: number;
  icon: string;
  name: string;
  dailySwipeLimit: number;
  price: number;  // Changed from price_cents - now stores in baht
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

// Form data types - what PackageForm sends
export interface PackageFormData {
  name: string;
  dailySwipeLimit: number;
  icon: string;
  iconFile: File | null;
  details: string[];
  price: number;  // Changed from price_cents - stores in baht
}

// Database operation types
export interface PackageInsert {
  name: string;
  daily_swipe_limit: number;
  icon: string;
  details: string[];
  price: number;  // Stores price in baht
  order_index?: number;
}

export interface PackageUpdate {
  id?: number;
  name?: string;
  daily_swipe_limit?: number;
  icon?: string;
  details?: string[];
  price?: number;  // Stores price in baht
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

// Component interfaces
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
  onSubmit: (packageData: PackageFormData) => Promise<void>;
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