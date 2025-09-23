# Profile Pages Documentation

## Overview
This document describes the profile pages functionality for the Merry Match application, including both user's own profile and viewing other users' profiles.

## Features

### 1. User's Own Profile (`/profile`)
- **Purpose**: Display user's own profile information
- **Authentication**: Required (redirects to login if not authenticated)
- **Data Source**: `/api/profile/me`
- **Features**:
  - View personal information
  - Like/Pass functionality (mock)
  - Edit profile button
  - Responsive design

### 2. Other User's Profile (`/user-profile/[id]`)
- **Purpose**: Display other users' profile information
- **Authentication**: Required (redirects to login if not authenticated)
- **Data Source**: `/api/profile/[id]`
- **Features**:
  - View public information only
  - Like/Pass functionality (mock)
  - No edit access
  - Responsive design

## API Endpoints

### 1. `/api/profile/me`
- **Method**: GET
- **Authentication**: Bearer token required
- **Response**: User's own profile data
- **Error Handling**: 401 if not authenticated, 404 if profile not found

### 2. `/api/profile/[id]`
- **Method**: GET
- **Authentication**: Bearer token required
- **Response**: Other user's profile data
- **Error Handling**: 401 if not authenticated, 404 if profile not found

## Security Features

### 1. Authentication Required
- All profile pages require user authentication
- Redirects to login page if not authenticated
- Uses Supabase Auth for session management

### 2. Data Privacy
- Email and username are not displayed in profile views
- Only public information is shown
- Sensitive data is protected

### 3. Authorization
- Users can only view their own profile data via `/api/profile/me`
- Users can view other users' public data via `/api/profile/[id]`
- No cross-user data access

## Technical Implementation

### 1. Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

### 2. Backend
- **API Routes**: Next.js API routes
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Error Handling**: Comprehensive error responses

### 3. Database Schema
- **Table**: `profiles`
- **Fields**: id, name, age, email, username, city, gender, sexual_preferences, racial_preferences, meeting_interests, bio, interests, photos

## Usage Instructions

### 1. Accessing Your Profile
1. Login to the application
2. Navigate to `/profile` or click profile button
3. View your profile information
4. Use Like/Pass buttons (currently mock functionality)

### 2. Viewing Other Users' Profiles
1. Login to the application
2. Navigate to `/user-profile/[id]` where [id] is the user's ID
3. View their public profile information
4. Use Like/Pass buttons (currently mock functionality)

## Error Handling

### 1. Authentication Errors
- **401 Unauthorized**: User not logged in
- **Solution**: Redirect to login page

### 2. Data Errors
- **404 Not Found**: Profile not found
- **Solution**: Display error message and redirect

### 3. Network Errors
- **500 Server Error**: Database connection issues
- **Solution**: Display error message and retry option

## Responsive Design

### 1. Desktop (1024px+)
- Two-column layout
- Large profile image
- Full information display

### 2. Tablet (768px - 1023px)
- Responsive layout
- Adjusted spacing
- Touch-friendly buttons

### 3. Mobile (< 768px)
- Single column layout
- Stacked information
- Mobile-optimized buttons

## Future Enhancements

### 1. Like/Pass Functionality
- Implement actual like/pass logic
- Connect to database
- Add match notifications

### 2. Edit Profile
- Create edit profile page
- Allow users to update their information
- Image upload functionality

### 3. Enhanced Security
- Role-based access control
- Data encryption
- Audit logging

## Troubleshooting

### 1. Profile Not Loading
- Check authentication status
- Verify API endpoint availability
- Check browser console for errors

### 2. Data Not Displaying
- Verify database connection
- Check API response format
- Validate data structure

### 3. Responsive Issues
- Test on different devices
- Check CSS media queries
- Verify Tailwind classes

## Support

For technical support or questions about the profile pages functionality, please contact the development team or refer to the main project documentation.
