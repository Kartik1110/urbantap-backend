# Frontend RBAC Integration Guide

## Overview
This guide covers how to integrate the backend RBAC system with your frontend application, including permission-based routing, UI components, and user experience considerations.

## 🏗️ Core Frontend Components Needed

### 1. Authentication Context with Permissions

```typescript
// contexts/AuthContext.tsx
interface User {
  id: string;
  email: string;
  type: 'ADMIN' | 'MEMBER';
  companyId: string;
  permissions: Permission[];
  broker?: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const hasPermission = useCallback((permission: Permission) => {
    if (user?.type === 'ADMIN') return true; // Admins have all permissions
    return permissions.includes(permission);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((perms: Permission[]) => {
    if (user?.type === 'ADMIN') return true;
    return perms.some(permission => permissions.includes(permission));
  }, [user, permissions]);

  const isAdmin = useCallback(() => {
    return user?.type === 'ADMIN';
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/admin-user/login', credentials);
      const token = response.data.token;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Get user profile and permissions
      const profileResponse = await api.get('/admin-user/profile');
      const userPermissions = await api.get('/admin-user/permissions');
      
      setUser(profileResponse.data.data);
      setPermissions(userPermissions.data.data);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      hasPermission,
      hasAnyPermission,
      isAdmin,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2. Permission-Based Route Protection

```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  adminOnly?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  adminOnly = false,
  fallback = <AccessDenied />
}: ProtectedRouteProps) {
  const { user, hasPermission, hasAnyPermission, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return fallback;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return fallback;
  }

  return <>{children}</>;
}

// Usage in router
<Route 
  path="/jobs/create" 
  element={
    <ProtectedRoute requiredPermission="CREATE_JOB">
      <CreateJobPage />
    </ProtectedRoute>
  } 
/>
```

### 3. Permission-Based UI Components

```typescript
// components/PermissionGate.tsx
interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  adminOnly?: boolean;
  fallback?: ReactNode;
  mode?: 'all' | 'any'; // require all permissions or any permission
}

export function PermissionGate({
  children,
  permission,
  permissions,
  adminOnly = false,
  fallback = null,
  mode = 'any'
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, isAdmin } = useAuth();

  if (adminOnly && !isAdmin()) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions) {
    const hasAccess = mode === 'all' 
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Usage examples
<PermissionGate permission="CREATE_JOB">
  <Button onClick={handleCreateJob}>Create Job</Button>
</PermissionGate>

<PermissionGate permissions={["EDIT_JOB", "DELETE_JOB"]} mode="any">
  <JobActionMenu />
</PermissionGate>
```

### 4. Dynamic Navigation Based on Permissions

```typescript
// components/Navigation.tsx
interface NavItem {
  label: string;
  path: string;
  permission?: Permission;
  permissions?: Permission[];
  adminOnly?: boolean;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    label: 'Jobs',
    path: '/jobs',
    children: [
      {
        label: 'View Jobs',
        path: '/jobs',
        permissions: ['VIEW_JOB']
      },
      {
        label: 'Create Job',
        path: '/jobs/create',
        permission: 'CREATE_JOB'
      }
    ]
  },
  {
    label: 'Company Posts',
    path: '/posts',
    children: [
      {
        label: 'View Posts',
        path: '/posts',
        permissions: ['VIEW_COMPANY_POST']
      },
      {
        label: 'Create Post',
        path: '/posts/create',
        permission: 'CREATE_COMPANY_POST'
      }
    ]
  },
  {
    label: 'Team Management',
    path: '/team',
    adminOnly: true,
    children: [
      {
        label: 'Team Members',
        path: '/team/members',
        adminOnly: true
      },
      {
        label: 'Role Groups',
        path: '/team/roles',
        adminOnly: true
      }
    ]
  }
];

export function Navigation() {
  const { hasPermission, hasAnyPermission, isAdmin } = useAuth();

  const isNavItemVisible = (item: NavItem): boolean => {
    if (item.adminOnly && !isAdmin()) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.permissions && !hasAnyPermission(item.permissions)) return false;
    return true;
  };

  const renderNavItem = (item: NavItem) => {
    if (!isNavItemVisible(item)) return null;

    return (
      <li key={item.path}>
        <Link to={item.path}>{item.label}</Link>
        {item.children && (
          <ul>
            {item.children.map(child => renderNavItem(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav>
      <ul>
        {navigationItems.map(item => renderNavItem(item))}
      </ul>
    </nav>
  );
}
```

## 📋 Complete Page Components

### 1. Jobs Management

```typescript
// pages/JobsPage.tsx
export function JobsPage() {
  const { hasPermission, isAdmin, user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Backend automatically filters jobs based on permissions
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const response = await api.get('/admin-user/jobs');
    setJobs(response.data.data);
  };

  const canEditJob = (job: Job) => {
    if (isAdmin()) return true;
    if (!hasPermission('EDIT_JOB')) return false;
    return job.admin_user_id === user?.id; // Individual level check
  };

  const canDeleteJob = (job: Job) => {
    if (isAdmin()) return true;
    if (!hasPermission('DELETE_JOB')) return false;
    return job.admin_user_id === user?.id;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Jobs</h1>
        <PermissionGate permission="CREATE_JOB">
          <Link to="/jobs/create">
            <Button>Create Job</Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="jobs-list">
        {jobs.map(job => (
          <div key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <div className="job-actions">
              {canEditJob(job) && (
                <Link to={`/jobs/${job.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              )}
              {canDeleteJob(job) && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteJob(job.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Team Management (Admin Only)

```typescript
// pages/TeamMembersPage.tsx
export function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [roleGroups, setRoleGroups] = useState([]);
  const [availableBrokers, setAvailableBrokers] = useState([]);

  const fetchTeamMembers = async () => {
    const response = await api.get('/admin-user/team-members');
    setTeamMembers(response.data.data);
  };

  const fetchRoleGroups = async () => {
    const response = await api.get('/admin-user/role-groups');
    setRoleGroups(response.data.data);
  };

  const fetchAvailableBrokers = async () => {
    const response = await api.get('/admin-user/available-brokers');
    setAvailableBrokers(response.data.data);
  };

  return (
    <ProtectedRoute adminOnly>
      <div>
        <div className="page-header">
          <h1>Team Members</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            Add Team Member
          </Button>
        </div>

        <TeamMembersList 
          members={teamMembers}
          onMemberUpdate={fetchTeamMembers}
        />

        <CreateTeamMemberModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          roleGroups={roleGroups}
          availableBrokers={availableBrokers}
          onSuccess={fetchTeamMembers}
        />
      </div>
    </ProtectedRoute>
  );
}
```

## 🔧 API Integration Helpers

### 1. API Client with Token Management

```typescript
// utils/api.ts
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    if (response.status === 403) {
      throw new Error('Access denied: Insufficient permissions');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Convenience methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(process.env.REACT_APP_API_URL || 'http://localhost:3000/api');
```

### 2. Resource Management Hooks

```typescript
// hooks/useJobs.ts
export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission, isAdmin, user } = useAuth();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin-user/jobs');
      setJobs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: CreateJobData) => {
    if (!hasPermission('CREATE_JOB')) {
      throw new Error('No permission to create jobs');
    }
    
    const response = await api.post('/admin-user/jobs', jobData);
    await fetchJobs(); // Refresh list
    return response.data.data;
  };

  const updateJob = async (jobId: string, jobData: UpdateJobData) => {
    // Check permission and ownership
    const job = jobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');
    
    if (!isAdmin() && job.admin_user_id !== user?.id) {
      throw new Error('No permission to edit this job');
    }
    
    const response = await api.put(`/admin-user/jobs/${jobId}`, jobData);
    await fetchJobs();
    return response.data.data;
  };

  const deleteJob = async (jobId: string) => {
    const response = await api.delete(`/admin-user/jobs/${jobId}`);
    await fetchJobs();
    return response.data;
  };

  const canEditJob = (job: Job) => {
    if (isAdmin()) return true;
    if (!hasPermission('EDIT_JOB')) return false;
    return job.admin_user_id === user?.id;
  };

  const canDeleteJob = (job: Job) => {
    if (isAdmin()) return true;
    if (!hasPermission('DELETE_JOB')) return false;
    return job.admin_user_id === user?.id;
  };

  return {
    jobs,
    loading,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    canEditJob,
    canDeleteJob,
  };
}
```

## 📱 User Experience Considerations

### 1. Loading States with Permissions

```typescript
// components/JobsList.tsx
export function JobsList() {
  const { jobs, loading, canEditJob, canDeleteJob } = useJobs();
  const { hasPermission } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        description={
          hasPermission('CREATE_JOB') 
            ? "Create your first job to get started"
            : "No jobs available to view"
        }
        action={
          hasPermission('CREATE_JOB') && (
            <Link to="/jobs/create">
              <Button>Create Job</Button>
            </Link>
          )
        }
      />
    );
  }

  return (
    <div className="jobs-grid">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          canEdit={canEditJob(job)}
          canDelete={canDeleteJob(job)}
        />
      ))}
    </div>
  );
}
```

### 2. Error Handling with Permissions

```typescript
// components/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    setError(error);
    
    // Log permission errors for monitoring
    if (error.message.includes('permission') || error.message.includes('Access denied')) {
      console.warn('Permission error:', error.message);
    }
  };

  if (error) {
    if (error.message.includes('Access denied') || error.message.includes('permission')) {
      return (
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to perform this action.</p>
          <Button onClick={() => setError(null)}>Go Back</Button>
        </div>
      );
    }

    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 3. Permission Indicators

```typescript
// components/PermissionIndicator.tsx
export function PermissionIndicator({ 
  permission, 
  showTooltip = true 
}: { 
  permission: Permission;
  showTooltip?: boolean;
}) {
  const { hasPermission } = useAuth();
  const hasAccess = hasPermission(permission);

  return (
    <div className={`permission-indicator ${hasAccess ? 'granted' : 'denied'}`}>
      {hasAccess ? (
        <CheckIcon className="w-4 h-4 text-green-600" />
      ) : (
        <XIcon className="w-4 h-4 text-red-600" />
      )}
      {showTooltip && (
        <Tooltip content={`${permission}: ${hasAccess ? 'Granted' : 'Denied'}`} />
      )}
    </div>
  );
}
```

## 🚀 Implementation Checklist

### Phase 1: Core Setup
- [ ] Set up authentication context with permissions
- [ ] Implement API client with token management
- [ ] Create ProtectedRoute component
- [ ] Create PermissionGate component
- [ ] Set up basic navigation with permission filtering

### Phase 2: Resource Management
- [ ] Implement jobs management with RBAC
- [ ] Implement company posts management with RBAC
- [ ] Add individual-level permission checks
- [ ] Create resource-specific hooks

### Phase 3: Admin Features
- [ ] Team members management UI
- [ ] Role groups management UI
- [ ] Available brokers selection
- [ ] Permission assignment interface

### Phase 4: UX Enhancements
- [ ] Loading states for permission checks
- [ ] Error handling for access denied
- [ ] Empty states with contextual messages
- [ ] Permission indicators and tooltips

### Phase 5: Testing & Monitoring
- [ ] Test all permission combinations
- [ ] Test admin vs member workflows
- [ ] Test individual-level restrictions
- [ ] Add analytics for permission usage

## 🔍 Testing Strategy

### Manual Testing Scenarios
1. **Admin User Testing**:
   - Login as admin → Should see all features
   - Create team members → Should work
   - View all company jobs/posts → Should work

2. **Job Manager Testing**:
   - Login as job-manager@demo.com
   - Try to create jobs → Should work
   - Try to create posts → Should be blocked
   - Try to edit other's jobs → Should be blocked

3. **Permission Boundary Testing**:
   - Test navigation hiding/showing
   - Test button visibility
   - Test API error handling
   - Test route protection

### Automated Testing
```typescript
// __tests__/permissions.test.tsx
describe('Permission System', () => {
  test('admin sees all navigation items', () => {
    const { getByText } = render(
      <AuthProvider initialUser={{ type: 'ADMIN', permissions: [] }}>
        <Navigation />
      </AuthProvider>
    );
    
    expect(getByText('Team Management')).toBeInTheDocument();
    expect(getByText('Create Job')).toBeInTheDocument();
  });

  test('job manager only sees job-related items', () => {
    const { getByText, queryByText } = render(
      <AuthProvider initialUser={{ 
        type: 'MEMBER', 
        permissions: ['CREATE_JOB', 'EDIT_JOB'] 
      }}>
        <Navigation />
      </AuthProvider>
    );
    
    expect(getByText('Create Job')).toBeInTheDocument();
    expect(queryByText('Team Management')).not.toBeInTheDocument();
  });
});
```

This comprehensive frontend implementation will give you a fully functional RBAC system that seamlessly integrates with your backend!
