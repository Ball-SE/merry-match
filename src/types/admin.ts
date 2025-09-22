import { ReactNode } from 'react';

export interface PackageType {
  id: number;
  icon: string;
  name: string;
  merryLimit: string;
  createdDate: string;
  updatedDate: string;
  details: string[];
}

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