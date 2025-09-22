"use client";

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PackageType, ViewType, ComplaintType } from '../../types/admin';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import PackageList from './PackageList';
import PackageForm from './PackageForm';
import DeleteModal from './DeleteModal';
import ComplaintList from './ComplaintList';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('merry-package');
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [packageToDelete, setPackageToDelete] = useState<PackageType | null>(null);
  const [packageSearchTerm, setPackageSearchTerm] = useState<string>('');
  const [complaintSearchTerm, setComplaintSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All status');
  const [packages, setPackages] = useState<PackageType[]>([
    {
      id: 1,
      icon: '💖',
      name: 'Basic',
      merryLimit: '25 Merry',
      createdDate: '12/02/2022 10:30PM',
      updatedDate: '12/02/2022 10:30PM',
      details: ['Merry more than 4 daily limited', 'Up to 25 Merry per day']
    },
    {
      id: 2,
      icon: '⭐',
      name: 'Platinum',
      merryLimit: '45 Merry',
      createdDate: '12/02/2022 10:30PM',
      updatedDate: '12/02/2022 10:30PM',
      details: ['Merry more than 4 daily limited', 'Up to 45 Merry per day']
    },
    {
      id: 3,
      icon: '✨',
      name: 'Premium',
      merryLimit: '70 Merry',
      createdDate: '12/02/2022 10:30PM',
      updatedDate: '12/02/2022 10:30PM',
      details: ['Merry more than 4 daily limited', 'Up to 70 Merry per day']
    }
  ]);

  const [complaints, setComplaints] = useState<ComplaintType[]>([
    {
      id: 1,
      user: 'Jon Snow',
      issue: 'I was insulted by Ygritte...',
      description: 'Hello, there was a problem with user "Ygritte" who insulted me during our conversation. This behavior was inappropriate and made me uncomfortable.',
      dateSubmitted: '12/02/2022',
      status: 'New'
    },
    {
      id: 2,
      user: 'Jon Snow',
      issue: 'I was insulted by Ygritte...',
      description: 'Hello, there was a problem with user "Ygritte" who insulted me during our conversation. This behavior was inappropriate and made me uncomfortable.',
      dateSubmitted: '12/02/2022',
      status: 'Pending'
    },
    {
      id: 3,
      user: 'Jon Snow',
      issue: 'I was insulted by Ygritte...',
      description: 'Hello, there was a problem with user "Ygritte" who insulted me during our conversation. This behavior was inappropriate and made me uncomfortable.',
      dateSubmitted: '12/02/2022',
      status: 'Cancel'
    },
    {
      id: 4,
      user: 'Jon Snow',
      issue: 'I was insulted by Ygritte...',
      description: 'Hello, there was a problem with user "Ygritte" who insulted me during our conversation. This behavior was inappropriate and made me uncomfortable.',
      dateSubmitted: '12/02/2022',
      status: 'Resolved'
    }
  ]);

  const handleDeletePackage = (id: number): void => {
    const pkg = packages.find(p => p.id === id);
    setPackageToDelete(pkg || null);
    setShowDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (packageToDelete) {
      setPackages(packages.filter(pkg => pkg.id !== packageToDelete.id));
      setShowDeleteModal(false);
      setPackageToDelete(null);
    }
  };

  const handleEditPackage = (pkg: PackageType): void => {
    setEditingPackage(pkg);
    setCurrentView('edit');
  };

  const handleAddPackage = (): void => {
    setEditingPackage(null);
    setCurrentView('add');
  };

  const handleCreatePackage = (packageData: {
    name: string;
    merryLimit: string;
    icon: string;
    details: string[];
  }): void => {
    const newPackage: PackageType = {
      id: Math.max(...packages.map(p => p.id)) + 1,
      name: packageData.name,
      merryLimit: `${packageData.merryLimit} Merry`,
      icon: packageData.icon,
      createdDate: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', ''),
      updatedDate: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', ''),
      details: packageData.details.filter(detail => detail.trim())
    };

    setPackages([...packages, newPackage]);
    setCurrentView('list');
  };

  const handleUpdatePackage = (packageData: {
    name: string;
    merryLimit: string;
    icon: string;
    details: string[];
  }): void => {
    if (!editingPackage) return;

    const updatedPackage: PackageType = {
      ...editingPackage,
      name: packageData.name,
      merryLimit: `${packageData.merryLimit} Merry`,
      icon: packageData.icon,
      updatedDate: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', ''),
      details: packageData.details.filter(detail => detail.trim())
    };

    setPackages(packages.map(pkg => 
      pkg.id === editingPackage.id ? updatedPackage : pkg
    ));
    setCurrentView('list');
    setEditingPackage(null);
  };

  const handleDeletePackageFromForm = (): void => {
    if (editingPackage) {
      setPackageToDelete(editingPackage);
      setShowDeleteModal(true);
    }
  };

  const moveRow = (dragIndex: number, hoverIndex: number): void => {
    const draggedPackage = packages[dragIndex];
    const newPackages = [...packages];
    newPackages.splice(dragIndex, 1);
    newPackages.splice(hoverIndex, 0, draggedPackage);
    setPackages(newPackages);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 bg-white">
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
            <div className="p-8 bg-gray-50">
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
                <PackageForm 
                  isEdit={false} 
                  editingPackage={null}
                  onSubmit={handleCreatePackage}
                  onDelete={handleDeletePackageFromForm}
                />
              )}

              {currentView === 'edit' && editingPackage && (
                <PackageForm 
                  isEdit={true} 
                  editingPackage={editingPackage}
                  onSubmit={handleUpdatePackage}
                  onDelete={handleDeletePackageFromForm}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'complaint' && (
          <div className="bg-gray-50">
            <ComplaintList
              complaints={complaints}
              searchTerm={complaintSearchTerm}
              statusFilter={statusFilter}
              onSearchChange={setComplaintSearchTerm}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
        )}
      </div>

      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default AdminDashboard;