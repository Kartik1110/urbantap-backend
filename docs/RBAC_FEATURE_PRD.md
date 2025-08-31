# Role-Based Access Control (RBAC) for AdminUsers - Product Requirements Document (PRD)

## 1. Overview

### 1.1 Purpose
Implement a comprehensive Role-Based Access Control (RBAC) system for AdminUsers to enable company admins to create team members with specific permissions for managing jobs and company posts. This system will provide granular access control while maintaining data security and proper authorization workflows.

### 1.2 Scope
- **Phase 1**: Team Member Management, Job & Company Post Permissions, Permission Utility Functions
- **Future Phases**: Listing Permissions, Analytics Access, Super Admin Features

## 2. Business Requirements

### 2.1 User Roles and Hierarchy

#### 2.1.1 Admin User (Type: ADMIN)
- Can create, edit, and delete team members
- Can assign role groups and permissions to team members
- Can view all jobs and company posts created by any team member in their company
- Has full access to all company resources
- Can manage broker assignments for team members

#### 2.1.2 Team Member (Type: MEMBER)
- Can only perform actions they have explicit permissions for
- Can only view jobs and company posts they created (unless given broader permissions)
- Must be linked to a broker within the company
- Cannot create other team members

### 2.2 Permission System

#### 2.2.1 Job Permissions
- `CREATE_JOB`: Create new job postings
- `EDIT_JOB`: Edit job postings (individual level - only jobs they created)
- `DELETE_JOB`: Delete job postings (individual level - only jobs they created)
- `VIEW_JOB`: View jobs(individual level - only jobs they created)

#### 2.2.2 Company Post Permissions
- `CREATE_COMPANY_POST`: Create new company posts
- `EDIT_COMPANY_POST`: Edit company posts (individual level - only posts they created)
- `DELETE_COMPANY_POST`: Delete company posts (individual level - only posts they created)
- `VIEW_COMPANY_POST`: View company posts(individual level - only jobs they created)

### 2.3 Team Member Management

#### 2.3.1 Creating Team Members
- Admin selects a broker from their company's broker list
- Admin creates email and password for the team member
- Admin assigns a role group with specific permissions
- System creates AdminUser record with type "MEMBER"
- System links the AdminUser to the selected broker

#### 2.3.2 Access Control Rules
- Team members can only access resources within their company
- Individual-level permissions restrict access to only resources they created
- Admin users have full visibility of all company resources
- Permission checks must be enforced at both API and service levels

## 3. Technical Requirements

### 3.1 Database Schema Updates

#### 3.1.1 CompanyPost Model Update
Add `adminUserId` field to track creator:

```sql
model CompanyPost {
  id           String       @id @default(uuid())
  title        String?
  caption      String?
  images       String[]     @default([])
  position     PostPosition @default(Home)
  rank         Int          @default(1)
  company_id   String
  company      Company      @relation(fields: [company_id], references: [id])
  adminUserId  String?      // NEW FIELD
  adminUser    AdminUser?   @relation(fields: [adminUserId], references: [id])
  expiry_date  DateTime?
  is_sponsored Boolean?     @default(false)
  created_at   DateTime     @default(now())
  updated_at   DateTime     @updatedAt
}
```

#### 3.1.2 AdminUser Model Update
Add relation to CompanyPost:

```sql
model AdminUser {
  id              String        @id @default(uuid())
  email           String        @unique
  password        String
  type            AdminUserType @default(MEMBER)
  broker_id       String?
  broker          Broker?       @relation(fields: [broker_id], references: [id])
  role_group_id   String?
  role_group      RoleGroup?    @relation(fields: [role_group_id], references: [id])
  company_id      String
  company         Company       @relation(fields: [company_id], references: [id])
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  jobs            Job[]
  companyPosts    CompanyPost[] // NEW RELATION
}
```

#### 3.1.3 Permission Enum Update
Add new permissions:

```sql
enum Permission {
  CREATE_JOB
  EDIT_JOB
  DELETE_JOB
  VIEW_ALL_COMPANY_JOBS
  CREATE_COMPANY_POST
  EDIT_COMPANY_POST
  DELETE_COMPANY_POST
  VIEW_ALL_COMPANY_POSTS
}
```

### 3.2 Permission Utility Functions

#### 3.2.1 Core Permission Checker
```typescript
// utils/permissions.ts
export class PermissionChecker {
  /**
   * Check if admin user has specific permission
   */
  static async hasPermission(
    adminUserId: string, 
    permission: Permission
  ): Promise<boolean>

  /**
   * Check if admin user can access specific resource
   */
  static async canAccessResource(
    adminUserId: string,
    resourceType: 'JOB' | 'COMPANY_POST',
    resourceId: string,
    action: 'CREATE' | 'EDIT' | 'DELETE' | 'VIEW'
  ): Promise<boolean>

  /**
   * Get all permissions for admin user
   */
  static async getUserPermissions(adminUserId: string): Promise<Permission[]>

  /**
   * Check if admin user is admin of company
   */
  static async isCompanyAdmin(adminUserId: string): Promise<boolean>

  /**
   * Validate admin user belongs to same company as resource
   */
  static async validateCompanyAccess(
    adminUserId: string,
    resourceType: 'JOB' | 'COMPANY_POST',
    resourceId: string
  ): Promise<boolean>
}
```

#### 3.2.2 Middleware for Route Protection
```typescript
// middlewares/rbac.middleware.ts
export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for permission checking
  }
}

export const requireResourceAccess = (
  resourceType: 'JOB' | 'COMPANY_POST',
  action: 'CREATE' | 'EDIT' | 'DELETE' | 'VIEW'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for resource-level access checking
  }
}
```

### 3.3 API Endpoints

#### 3.3.1 Team Member Management
```typescript
// routes/admin-team.routes.ts

// Create team member
POST /api/admin-user/team-members
Body: {
  brokerId: string,
  email: string,
  password: string,
  roleGroupId: string
}

// Get all team members
GET /api/admin-user/team-members

// Update team member role
PUT /api/admin-user/team-members/:id/role
Body: { roleGroupId: string }

// Delete team member
DELETE /api/admin-user/team-members/:id

// Get available brokers for team assignment
GET /api/admin-user/available-brokers
```

#### 3.3.2 Role Group Management
```typescript
// routes/role-groups.routes.ts

// Create role group
POST /api/admin-user/role-groups
Body: {
  name: string,
  description?: string,
  permissions: Permission[]
}

// Get all role groups
GET /api/admin-user/role-groups

// Update role group
PUT /api/admin-user/role-groups/:id
Body: {
  name?: string,
  description?: string,
  permissions?: Permission[]
}

// Delete role group
DELETE /api/admin-user/role-groups/:id
```

#### 3.3.3 Protected Resource Endpoints

##### Job Endpoints (Updated)
```typescript
// routes/job.routes.ts

// Create job (requires CREATE_JOB permission)
POST /api/jobs
Middleware: requirePermission('CREATE_JOB')

// Get jobs (filtered based on permissions)
GET /api/jobs
- If user has VIEW_ALL_COMPANY_JOBS: return all company jobs
- Otherwise: return only jobs created by the user

// Update job (requires EDIT_JOB permission + ownership)
PUT /api/jobs/:id
Middleware: requireResourceAccess('JOB', 'EDIT')

// Delete job (requires DELETE_JOB permission + ownership)
DELETE /api/jobs/:id
Middleware: requireResourceAccess('JOB', 'DELETE')
```

##### Company Post Endpoints (Updated)
```typescript
// routes/company-post.routes.ts

// Create company post (requires CREATE_COMPANY_POST permission)
POST /api/company-posts
Middleware: requirePermission('CREATE_COMPANY_POST')

// Get company posts (filtered based on permissions)
GET /api/company-posts
- If user has VIEW_ALL_COMPANY_POSTS: return all company posts
- Otherwise: return only posts created by the user

// Update company post (requires EDIT_COMPANY_POST permission + ownership)
PUT /api/company-posts/:id
Middleware: requireResourceAccess('COMPANY_POST', 'EDIT')

// Delete company post (requires DELETE_COMPANY_POST permission + ownership)
DELETE /api/company-posts/:id
Middleware: requireResourceAccess('COMPANY_POST', 'DELETE')
```

### 3.4 Service Layer Updates

#### 3.4.1 Job Service
```typescript
// services/job.service.ts
export class JobService {
  // Filter jobs based on user permissions
  static async getJobsForUser(adminUserId: string): Promise<Job[]>
  
  // Create job with proper admin user assignment
  static async createJob(adminUserId: string, jobData: CreateJobDTO): Promise<Job>
  
  // Validate job access before operations
  static async validateJobAccess(adminUserId: string, jobId: string): Promise<boolean>
}
```

#### 3.4.2 Company Post Service
```typescript
// services/company-post.service.ts
export class CompanyPostService {
  // Filter posts based on user permissions
  static async getPostsForUser(adminUserId: string): Promise<CompanyPost[]>
  
  // Create post with proper admin user assignment
  static async createPost(adminUserId: string, postData: CreatePostDTO): Promise<CompanyPost>
  
  // Validate post access before operations
  static async validatePostAccess(adminUserId: string, postId: string): Promise<boolean>
}
```

#### 3.4.3 Team Member Service
```typescript
// services/team-member.service.ts
export class TeamMemberService {
  // Create new team member
  static async createTeamMember(
    adminUserId: string,
    teamMemberData: CreateTeamMemberDTO
  ): Promise<AdminUser>
  
  // Get available brokers for company
  static async getAvailableBrokers(companyId: string): Promise<Broker[]>
  
  // Validate broker belongs to company
  static async validateBrokerCompany(brokerId: string, companyId: string): Promise<boolean>
}
```

## 4. Implementation Plan

### 4.1 Phase 1: Core RBAC Infrastructure (Week 1-2)
1. **Database Schema Updates**
   - Add `adminUserId` to CompanyPost model
   - Add new permissions to Permission enum
   - Create database migration

2. **Permission Utility Functions**
   - Implement PermissionChecker class
   - Create RBAC middleware functions
   - Add validation utilities

3. **Basic API Endpoints**
   - Team member CRUD operations
   - Role group management
   - Permission checking endpoints

### 4.2 Phase 2: Service Integration (Week 3)
1. **Job Service Updates**
   - Implement permission-based filtering
   - Add ownership validation
   - Update existing endpoints

2. **Company Post Service Updates**
   - Implement permission-based filtering
   - Add ownership validation
   - Create new CRUD operations

3. **Authentication Integration**
   - Update login flow for AdminUsers
   - Add permission context to JWT tokens
   - Implement session management

### 4.3 Phase 3: Testing & Validation (Week 4)
1. **Unit Tests**
   - Permission utility functions
   - Service layer validation
   - Middleware testing

2. **Integration Tests**
   - End-to-end permission flows
   - Role-based access scenarios
   - Security validation

3. **Performance Testing**
   - Permission checking performance
   - Database query optimization
   - Caching implementation

## 5. Security Considerations

### 5.1 Access Control
- All API endpoints must validate user permissions
- Resource ownership must be verified for individual-level permissions
- Company isolation must be enforced at all levels

### 5.2 Data Protection
- Sensitive operations require admin-level access
- Permission changes should be logged for audit
- Failed permission checks should be monitored

### 5.3 Authentication
- Strong password requirements for team members
- Session management for admin users
- JWT token validation with permission context

## 6. Testing Strategy

### 6.1 Unit Tests
- Permission checking functions
- Service layer methods
- Middleware validation

### 6.2 Integration Tests
- Complete RBAC workflows
- Cross-service permission validation
- API endpoint authorization

### 6.3 Security Tests
- Permission bypass attempts
- Unauthorized access scenarios
- Data isolation validation

## 7. Monitoring & Analytics

### 7.1 Metrics to Track
- Permission check performance
- Failed authorization attempts
- Team member activity levels
- Resource access patterns

### 7.2 Logging Requirements
- All permission checks
- Team member operations
- Role group modifications
- Failed access attempts

## 8. Success Criteria

### 8.1 Functional Requirements
- ✅ Admin can create team members linked to company brokers
- ✅ Team members can only perform authorized actions
- ✅ Individual-level permissions properly restrict resource access
- ✅ Admin has full visibility of company resources
- ✅ Permission validation works across all endpoints

### 8.2 Non-Functional Requirements
- ✅ Permission checks complete within 50ms
- ✅ System supports up to 100 team members per company
- ✅ Zero data leakage between companies
- ✅ 99.9% uptime for permission validation

## 9. Risk Assessment

### 9.1 Technical Risks
- **Performance Impact**: Permission checks on every request
  - *Mitigation*: Implement caching and optimize queries
- **Complex Permission Logic**: Individual vs company-level permissions
  - *Mitigation*: Comprehensive testing and clear documentation

### 9.2 Security Risks
- **Permission Bypass**: Potential vulnerabilities in access control
  - *Mitigation*: Security reviews and penetration testing
- **Data Exposure**: Improper company isolation
  - *Mitigation*: Multiple validation layers and audit logging

## 10. Future Enhancements

### 10.1 Phase 2 Features
- Listing permissions and management
- Advanced role templates
- Bulk permission operations

### 10.2 Phase 3 Features
- Super admin platform access
- Analytics and reporting permissions
- Custom permission creation

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Development Team  
**Reviewers**: Product Team, Security Team
