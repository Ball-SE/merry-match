"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { PackageType, ViewType, ComplaintType } from '../../types/admin';
import { DatabaseService } from '../../services/database';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import PackageList from './PackageList';
import PackageForm from './PackageForm';
import DeleteModal from './DeleteModal';
import ComplaintList from './ComplaintList';
import ComplaintDetail from './ComplaintDetail';
import ComplaintModal from './ComplaintModal';

const AdminDashboard: React.FC = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('merry-package');
  const [currentView, setCurrentView] = useState<ViewType>('list');
  
  // Package state
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<PackageType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [packageSearchTerm, setPackageSearchTerm] = useState<string>('');
  
  // Complaint state
  const [complaints, setComplaints] = useState<ComplaintType[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'resolve' | 'cancel'>('resolve');
  const [complaintSearchTerm, setComplaintSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All status');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize component and load data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        console.log('Initializing dashboard...');
        
        // Test database connection first
        console.log('Testing database connection...');
        const connectionOk = await DatabaseService.testConnection();
        if (!connectionOk) {
          console.warn('Database connection test failed, but continuing anyway...');
          // Temporarily comment out the throw to see more specific errors
          // throw new Error('Could not connect to database. Please check your Supabase configuration.');
        }

        // Load initial data
        await Promise.all([
          loadPackages(),
          loadComplaints()
        ]);

        setInitialized(true);
        console.log('Dashboard initialized successfully');
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize dashboard';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // ==================== DATA LOADING FUNCTIONS ====================

  const loadPackages = async (): Promise<void> => {
    try {
      const data = await DatabaseService.getPackages();
      setPackages(data);
      console.log('Loaded packages:', data.length);
    } catch (err) {
      console.error('Error loading packages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load packages';
      throw new Error(errorMessage);
    }
  };

  const loadComplaints = async (): Promise<void> => {
    try {
      const data = await DatabaseService.getComplaints();
      setComplaints(data);
      console.log('Loaded complaints:', data.length);
    } catch (err) {
      console.error('Error loading complaints:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load complaints';
      throw new Error(errorMessage);
    }
  };

  // ==================== PACKAGE HANDLERS ====================

  const handleAddPackage = (): void => {
    setEditingPackage(null);
    setCurrentView('add');
  };

  const handleEditPackage = (pkg: PackageType): void => {
    setEditingPackage(pkg);
    setCurrentView('edit');
  };

  const handleDeletePackage = (id: number): void => {
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      setPackageToDelete(pkg);
      setShowDeleteModal(true);
    }
  };

  const handleDeletePackageFromForm = (): void => {
    if (editingPackage) {
      setPackageToDelete(editingPackage);
      setShowDeleteModal(true);
    }
  };

  const handleCreatePackage = async (packageData: {
    name: string;
    merryLimit: string;
    icon: string;
    details: string[];
  }): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Creating package with data:', packageData);
      const newPackage = await DatabaseService.createPackage(packageData);
      
      setPackages(prevPackages => [...prevPackages, newPackage]);
      setCurrentView('list');
      
      console.log('Package created successfully, returning to list view');
    } catch (err) {
      console.error('Error creating package:', err);
      
      let errorMessage = 'Failed to create package. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Failed to create package: ${err.message}`;
      }
      
      setError(errorMessage);
      throw err; // Re-throw so form can handle it too
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async (packageData: {
    name: string;
    merryLimit: string;
    icon: string;
    details: string[];
  }): Promise<void> => {
    if (!editingPackage) return;

    try {
      setLoading(true);
      setError('');
      
      console.log('Updating package:', editingPackage.id, 'with data:', packageData);
      const updatedPackage = await DatabaseService.updatePackage(editingPackage.id, packageData);
      
      setPackages(prevPackages => 
        prevPackages.map(pkg => 
          pkg.id === editingPackage.id ? updatedPackage : pkg
        )
      );
      
      setCurrentView('list');
      setEditingPackage(null);
      
      console.log('Package updated successfully, returning to list view');
    } catch (err) {
      console.error('Error updating package:', err);
      
      let errorMessage = 'Failed to update package. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Failed to update package: ${err.message}`;
      }
      
      setError(errorMessage);
      throw err; // Re-throw so form can handle it too
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!packageToDelete) return;

    try {
      setLoading(true);
      setError('');
      
      console.log('Deleting package:', packageToDelete.id);
      await DatabaseService.deletePackage(packageToDelete.id);
      
      setPackages(prevPackages => 
        prevPackages.filter(pkg => pkg.id !== packageToDelete.id)
      );
      
      setShowDeleteModal(false);
      setPackageToDelete(null);
      
      // If we were editing this package, go back to list view
      if (editingPackage && editingPackage.id === packageToDelete.id) {
        setEditingPackage(null);
        setCurrentView('list');
      }
      
      console.log('Package deleted successfully');
    } catch (err) {
      console.error('Error deleting package:', err);
      
      let errorMessage = 'Failed to delete package. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Failed to delete package: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const moveRow = async (dragIndex: number, hoverIndex: number): Promise<void> => {
    const draggedPackage = packages[dragIndex];
    const newPackages = [...packages];
    newPackages.splice(dragIndex, 1);
    newPackages.splice(hoverIndex, 0, draggedPackage);
    
    // Update state immediately for better UX
    setPackages(newPackages);
    
    try {
      await DatabaseService.reorderPackages(newPackages);
      console.log('Packages reordered successfully');
    } catch (err) {
      console.error('Error reordering packages:', err);
      setError('Failed to reorder packages. Please try again.');
      
      // Revert changes on error by reloading from database
      try {
        await loadPackages();
      } catch (reloadErr) {
        console.error('Error reloading packages after failed reorder:', reloadErr);
      }
    }
  };

  // ==================== COMPLAINT HANDLERS ====================

  const handleComplaintClick = async (complaint: ComplaintType): Promise<void> => {
    try {
      // Auto-change status from "New" to "Pending" when clicked
      if (complaint.status === 'New') {
        setLoading(true);
        console.log('Auto-updating complaint status to Pending for complaint:', complaint.id);
        
        const updatedComplaint = await DatabaseService.updateComplaintStatus(complaint.id, 'Pending');
        
        // Update the complaint in the list
        setComplaints(prevComplaints => 
          prevComplaints.map(c => 
            c.id === complaint.id ? updatedComplaint : c
          )
        );
        
        setSelectedComplaint(updatedComplaint);
        console.log('Complaint status updated to Pending successfully');
      } else {
        setSelectedComplaint(complaint);
      }
    } catch (err) {
      console.error('Error updating complaint status:', err);
      
      let errorMessage = 'Failed to update complaint status. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Failed to update complaint status: ${err.message}`;
      }
      
      setError(errorMessage);
      setSelectedComplaint(complaint); // Show complaint anyway
    } finally {
      setLoading(false);
    }
  };

  const handleBackToComplaintList = (): void => {
    setSelectedComplaint(null);
  };

  const handleResolveComplaint = (complaintId: number): void => {
    setModalType('resolve');
    setShowComplaintModal(true);
  };

  const handleCancelComplaint = (complaintId: number): void => {
    setModalType('cancel');
    setShowComplaintModal(true);
  };

  const confirmComplaintAction = async (): Promise<void> => {
    if (!selectedComplaint) return;

    try {
      setLoading(true);
      setError('');
      
      const status = modalType === 'resolve' ? 'Resolved' : 'Cancel';
      console.log(`Updating complaint ${selectedComplaint.id} status to:`, status);
      
      const updatedComplaint = await DatabaseService.updateComplaintStatus(selectedComplaint.id, status);

      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.id === selectedComplaint.id ? updatedComplaint : complaint
        )
      );

      setSelectedComplaint(updatedComplaint);
      setShowComplaintModal(false);
      
      console.log('Complaint status updated successfully to:', status);
    } catch (err) {
      console.error('Error updating complaint:', err);
      
      let errorMessage = 'Failed to update complaint. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Failed to update complaint: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== UI COMPONENTS ====================

  const ErrorDisplay = () => {
    if (!error) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 flex-1">{error}</p>
          <button 
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const LoadingDisplay = () => {
    if (!loading) return null;

    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  };

  const InitializationDisplay = () => {
    if (initialized) return null;

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Initializing Dashboard</h3>
          <p className="text-gray-500">Connecting to database and loading data...</p>
        </div>
      </div>
    );
  };

  // Don't render main content until initialized
  if (!initialized && !error) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 bg-white overflow-auto">
          <div className="p-8 bg-[#F6F7FC]">
            <ErrorDisplay />
            <InitializationDisplay />
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 bg-white overflow-auto">
        {activeTab === 'merry-package' && (
          <>
            <TopNavigation 
              currentView={currentView}
              setCurrentView={setCurrentView}
              editingPackage={editingPackage}
              handleAddPackage={handleAddPackage}
              searchTerm={packageSearchTerm}
              onSearchChange={setPackageSearchTerm}
            />
            <div className="bg-[#F6F7FC] pt-6">
              <div className="px-6">
                <ErrorDisplay />
                <LoadingDisplay />
              </div>
              
              {currentView === 'list' && (
                <PackageList
                  packages={packages}
                  handleDeletePackage={handleDeletePackage}
                  handleEditPackage={handleEditPackage}
                  moveRow={moveRow}
                  searchTerm={packageSearchTerm}
                />
              )}

              {currentView === 'add' && (
                <div className="p-6">
                  <PackageForm 
                    isEdit={false} 
                    editingPackage={null}
                    onSubmit={handleCreatePackage}
                    onDelete={handleDeletePackageFromForm}
                  />
                </div>
              )}

              {currentView === 'edit' && editingPackage && (
                <div className="p-6">
                  <PackageForm 
                    isEdit={true} 
                    editingPackage={editingPackage}
                    onSubmit={handleUpdatePackage}
                    onDelete={handleDeletePackageFromForm}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'complaint' && (
          <div className="bg-[#F6F7FC]">
            <ErrorDisplay />
            <LoadingDisplay />

            {!selectedComplaint ? (
              <ComplaintList
                complaints={complaints}
                searchTerm={complaintSearchTerm}
                statusFilter={statusFilter}
                onSearchChange={setComplaintSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onComplaintClick={handleComplaintClick}
              />
            ) : (
                <ComplaintDetail
                  complaint={selectedComplaint}
                  onBack={handleBackToComplaintList}
                  onResolve={handleResolveComplaint}
                  onCancel={handleCancelComplaint}
                />
            )}
          </div>
        )}
      </div>

      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        confirmDelete={confirmDelete}
      />

      <ComplaintModal
        showModal={showComplaintModal}
        setShowModal={setShowComplaintModal}
        onConfirm={confirmComplaintAction}
        type={modalType}
      />
    </div>
  );
};

export default AdminDashboard;