// services/database.ts

import { supabase } from '../lib/supabase/supabaseClient';
import { 
  PackageType, 
  ComplaintType, 
  PackageFormData, 
  PackageDbType, 
  ComplaintDbType,
  PackageInsert, 
  PackageUpdate, 
  ComplaintUpdate 
} from '../types/admin';

class DatabaseServiceClass {
  
  // Utility functions to convert between frontend and database types
  private dbPackageToFrontend(dbPackage: PackageDbType): PackageType {
    return {
      id: dbPackage.id,
      name: dbPackage.name,
      dailySwipeLimit: dbPackage.daily_swipe_limit,
      icon: dbPackage.icon,
      details: dbPackage.details,
      price_cents: dbPackage.price_cents,
      createdDate: dbPackage.created_at || '',
      updatedDate: dbPackage.updated_at || ''
    };
  }

  private dbComplaintToFrontend(dbComplaint: ComplaintDbType): ComplaintType {
    return {
      id: dbComplaint.id,
      user: dbComplaint.user_name,
      issue: dbComplaint.issue,
      description: dbComplaint.description,
      dateSubmitted: dbComplaint.date_submitted,
      status: dbComplaint.status,
      resolvedDate: dbComplaint.resolved_date || undefined,
      canceledDate: dbComplaint.canceled_date || undefined
    };
  }

  // ==================== IMAGE UPLOAD METHODS ====================

  /**
   * Upload an icon to Supabase Storage
   * @param file - The image file to upload
   * @returns The public URL of the uploaded image
   */
  async uploadIcon(file: File): Promise<string> {
    try {
      console.log('Uploading icon:', file.name);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = `package-icons/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('package-icons') // Make sure this bucket exists in your Supabase project
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload icon: ${uploadError.message}`);
      }

      // Get public URL
      const { data } = supabase.storage
        .from('package-icons')
        .getPublicUrl(filePath);

      console.log('Icon uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading icon:', error);
      throw error;
    }
  }

  /**
   * Delete an icon from Supabase Storage
   * @param iconUrl - The URL of the icon to delete
   */
  async deleteIcon(iconUrl: string): Promise<void> {
    try {
      // Extract the file path from the URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/package-icons/[filepath]
      const urlParts = iconUrl.split('/package-icons/');
      if (urlParts.length < 2) {
        console.warn('Invalid icon URL format, skipping deletion:', iconUrl);
        return;
      }

      const filePath = `package-icons/${urlParts[1]}`;
      console.log('Deleting icon:', filePath);

      const { error } = await supabase.storage
        .from('package-icons')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting icon:', error);
        // Don't throw error here - we don't want to fail the whole operation if icon deletion fails
      } else {
        console.log('Icon deleted successfully');
      }
    } catch (error) {
      console.error('Error in deleteIcon:', error);
      // Don't throw - this is a cleanup operation
    }
  }

  // ==================== PACKAGE METHODS ====================

  async getPackages(): Promise<PackageType[]> {
    try {
      console.log('Fetching packages...');
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Supabase error fetching packages:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }

      // Convert database format to frontend format
      const frontendPackages = (data || []).map(pkg => this.dbPackageToFrontend(pkg));
      
      console.log('Packages fetched successfully:', frontendPackages.length, 'packages');
      return frontendPackages;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  async createPackage(packageData: PackageFormData): Promise<PackageType> {
    try {
      console.log('Creating package with data:', packageData);

      // Upload icon if there's a file, otherwise use the provided icon URL
      let iconUrl = packageData.icon;
      if (packageData.iconFile) {
        console.log('Uploading new icon file...');
        iconUrl = await this.uploadIcon(packageData.iconFile);
      }

      // Get the highest order_index and add 1
      const { data: maxOrderData } = await supabase
        .from('packages')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

      // Convert frontend data to database format
      const dbData: PackageInsert = {
        name: packageData.name,
        daily_swipe_limit: packageData.dailySwipeLimit,
        icon: iconUrl, // Use the uploaded URL
        details: packageData.details,
        price_cents: packageData.price_cents,
        order_index: nextOrderIndex
      };

      console.log('Inserting package data:', dbData);

      const { data, error } = await supabase
        .from('packages')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating package:', error);
        // If database insert fails and we uploaded a new icon, try to clean it up
        if (packageData.iconFile && iconUrl !== packageData.icon) {
          await this.deleteIcon(iconUrl);
        }
        throw new Error(`Failed to create package: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from package creation');
      }

      const frontendPackage = this.dbPackageToFrontend(data);
      console.log('Package created successfully:', frontendPackage);
      return frontendPackage;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  async updatePackage(id: number, packageData: PackageFormData): Promise<PackageType> {
    try {
      console.log('Updating package:', id, 'with data:', packageData);

      // Get the existing package to check if we need to delete the old icon
      const { data: existingPackage, error: fetchError } = await supabase
        .from('packages')
        .select('icon')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing package:', fetchError);
      }

      // Upload new icon if there's a file
      let iconUrl = packageData.icon;
      if (packageData.iconFile) {
        console.log('Uploading new icon file...');
        iconUrl = await this.uploadIcon(packageData.iconFile);

        // Delete old icon if it exists and is different from the new one
        if (existingPackage && existingPackage.icon && existingPackage.icon !== iconUrl) {
          await this.deleteIcon(existingPackage.icon);
        }
      }

      // Convert frontend data to database format
      const dbData: PackageUpdate = {
        name: packageData.name,
        daily_swipe_limit: packageData.dailySwipeLimit,
        icon: iconUrl, // Use the uploaded URL
        details: packageData.details,
        price_cents: packageData.price_cents,
        updated_at: new Date().toISOString()
      };

      console.log('Updating package with:', dbData);

      const { data, error } = await supabase
        .from('packages')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating package:', error);
        // If database update fails and we uploaded a new icon, try to clean it up
        if (packageData.iconFile && iconUrl !== packageData.icon) {
          await this.deleteIcon(iconUrl);
        }
        throw new Error(`Failed to update package: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from package update');
      }

      const frontendPackage = this.dbPackageToFrontend(data);
      console.log('Package updated successfully:', frontendPackage);
      return frontendPackage;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  async deletePackage(id: number): Promise<void> {
    try {
      console.log('Deleting package:', id);

      // Get the package to find its icon URL
      const { data: packageData, error: fetchError } = await supabase
        .from('packages')
        .select('icon')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching package for deletion:', fetchError);
      }

      // Delete the package from database
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting package:', error);
        throw new Error(`Failed to delete package: ${error.message}`);
      }

      // Delete the icon from storage if it exists
      if (packageData && packageData.icon) {
        await this.deleteIcon(packageData.icon);
      }

      console.log('Package deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }

  async reorderPackages(packages: PackageType[]): Promise<void> {
    try {
      console.log('Reordering packages...');

      // Update each package with its new order_index
      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];
        const { error } = await supabase
          .from('packages')
          .update({ order_index: i + 1 })
          .eq('id', pkg.id);

        if (error) {
          console.error(`Error updating order for package ${pkg.id}:`, error);
          throw new Error(`Failed to reorder packages: ${error.message}`);
        }
      }

      console.log('Packages reordered successfully');
    } catch (error) {
      console.error('Error reordering packages:', error);
      throw error;
    }
  }

  // ==================== COMPLAINT METHODS ====================

  async getComplaints(): Promise<ComplaintType[]> {
    try {
      console.log('Fetching complaints...');

      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('date_submitted', { ascending: false });

      if (error) {
        console.error('Supabase error fetching complaints:', error);
        throw new Error(`Failed to fetch complaints: ${error.message}`);
      }

      // Convert database format to frontend format
      const frontendComplaints = (data || []).map(complaint => this.dbComplaintToFrontend(complaint));
      
      console.log('Complaints fetched successfully:', frontendComplaints.length, 'complaints');
      return frontendComplaints;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  }

  async updateComplaintStatus(id: number, status: string): Promise<ComplaintType> {
    try {
      console.log('Updating complaint status:', id, 'to', status);

      const updateData: ComplaintUpdate = {
        status,
        updated_at: new Date().toISOString()
      };

      // Add specific date fields based on status
      if (status === 'Resolved') {
        updateData.resolved_date = new Date().toISOString();
        updateData.canceled_date = null;
      } else if (status === 'Cancel') {
        updateData.canceled_date = new Date().toISOString();
        updateData.resolved_date = null;
      }

      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating complaint status:', error);
        throw new Error(`Failed to update complaint status: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from complaint status update');
      }

      const frontendComplaint = this.dbComplaintToFrontend(data);
      console.log('Complaint status updated successfully:', frontendComplaint);
      return frontendComplaint;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing database connection...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
      console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

      const { error } = await supabase
        .from('packages')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('Connection test failed:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }

  // Get database info for debugging
  async getDatabaseInfo(): Promise<void> {
    try {
      console.log('=== DATABASE INFO ===');
      
      // Test packages table
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('count', { count: 'exact' })
        .limit(1);

      if (packagesError) {
        console.error('Packages table error:', packagesError);
      } else {
        console.log('Packages table accessible, count:', packagesData);
      }

      // Test complaints table
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('count', { count: 'exact' })
        .limit(1);

      if (complaintsError) {
        console.error('Complaints table error:', complaintsError);
      } else {
        console.log('Complaints table accessible, count:', complaintsData);
      }

      // Test storage bucket
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('package-icons')
        .list('', { limit: 1 });

      if (storageError) {
        console.error('Storage bucket error:', storageError);
      } else {
        console.log('Storage bucket accessible');
      }

      console.log('=== END DATABASE INFO ===');
    } catch (error) {
      console.error('Error getting database info:', error);
    }
  }
}

// Export singleton instance
export const DatabaseService = new DatabaseServiceClass();
export default DatabaseService;