# Advertisement Feature - Product Requirements Document (PRD)

## 1. Overview

### 1.1 Purpose
Implement a credit-based advertisement system where companies can purchase credits and use them to promote their jobs and company posts. Admin users of companies can buy credits and create sponsored content that gets prioritized visibility.

### 1.2 Scope
- **Phase 1**: Featured Jobs and Featured Company Posts
- **Future Phases**: Featured Listings, Homepage Banners, Analytics

## 2. Business Requirements

### 2.1 Credit System
Based on the provided credit package structure:

| Credit Pack | AED Price | Credits Included | Rate per Credit |
|-------------|-----------|------------------|-----------------|
| Basic Pack | AED 500 | 500 credits | AED 1.00 |
| Value Pack | AED 2,000 | 2,200 credits | AED 0.91 |
| Pro Pack | AED 5,000 | 6,000 credits | AED 0.83 |
| Enterprise Pack | AED 10,000 | 12,500 credits | AED 0.80 |

### 2.2 Advertisement Types (Phase 1)

| Ad Product | Credit Cost | Visibility Duration | Placement |
|------------|-------------|-------------------|-----------|
| Featured Job | 250 credits | 7 days | Top of job listings |
| Featured Company Post | 300 credits | 7 days | Homepage/position-based priority |

## 3. Technical Requirements

### 3.1 Database Schema Updates

#### 3.1.1 New Models

```sql
-- Credits Model
model Credit {
  id           String   @id @default(uuid())
  company_id   String
  balance      Int      @default(0)
  expiry_date  DateTime
  start_date   DateTime @default(now())
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  company      Company  @relation(fields: [company_id], references: [id])
  
  @@unique([company_id])
}

-- Order Model (for audit trail)
model Order {
  id           String    @id @default(uuid())
  company_id   String
  type         OrderType
  date         DateTime  @default(now())
  credits_spent Int
  type_id      String    // ID of Job or CompanyPost
  created_at   DateTime  @default(now())
  company      Company   @relation(fields: [company_id], references: [id])
}

enum OrderType {
  COMPANY_POST
  JOB
  LISTING
}
```

#### 3.1.2 Model Updates

```sql
-- Update CompanyPost Model
model CompanyPost {
  id           String       @id @default(uuid())
  title        String?
  caption      String?
  images       String[]     @default([])
  position     PostPosition @default(Home)
  rank         Int          @default(1)
  company_id   String
  company      Company      @relation(fields: [company_id], references: [id])
  expiry_date  DateTime?    // NEW: For sponsored posts
  is_sponsored Boolean?     @default(false) // NEW
  created_at   DateTime     @default(now())
  updated_at   DateTime     @updatedAt
}

-- Job Model (already has required fields)
-- expiry_date and is_sponsored fields already exist
```

#### 3.1.3 Company Model Update

```sql
model Company {
  // ... existing fields
  credits      Credit[]
  orders       Order[]
  // ... rest of existing relations
}
```

### 3.2 Configuration Management

Create a configuration system for credit expiry and pricing:

```typescript
// Credit Configuration
interface CreditConfig {
  defaultExpiryDays: number; // Configurable expiry period
  creditPricing: {
    featuredJob: number;
    featuredCompanyPost: number;
  };
  visibilityDuration: {
    featuredJob: number; // days
    featuredCompanyPost: number; // days
  };
}
```

## 4. API Requirements

### 4.1 Credit Management APIs

#### 4.1.1 Assign Credits to Company
```typescript
POST /api/admin/credits/assign
Authorization: Admin Token
Body: {
  company_id: string;
  credits: number;
  expiry_days?: number; // Optional, defaults to config
}
Response: {
  success: boolean;
  data: Credit;
}
```

#### 4.1.2 Get Company Credit Balance
```typescript
GET /api/admin-user/credits/balance
Authorization: AdminUser Token
Response: {
  success: boolean;
  data: {
    balance: number;
    expiry_date: string;
    start_date: string;
  };
}
```

#### 4.1.3 Get Credit Usage History
```typescript
GET /api/admin-user/credits/history
Authorization: AdminUser Token
Query: {
  page?: number;
  limit?: number;
}
Response: {
  success: boolean;
  data: {
    orders: Order[];
    pagination: PaginationInfo;
  };
}
```

### 4.2 Enhanced Content Creation APIs

#### 4.2.1 Create Sponsored Job
```typescript
POST /api/admin-user/jobs/sponsored
Authorization: AdminUser Token
Body: {
  // All existing job fields
  title: string;
  workplace_type: WorkplaceType;
  location: string;
  job_type: JobType;
  description: string;
  // ... other job fields
  sponsor_duration_days?: number; // Optional, defaults to config
}
Response: {
  success: boolean;
  data: Job;
  credits_deducted: number;
  remaining_balance: number;
}
```

#### 4.2.2 Create Sponsored Company Post
```typescript
POST /api/admin-user/company-posts/sponsored
Authorization: AdminUser Token
Body: {
  // All existing company post fields
  title?: string;
  caption?: string;
  position: PostPosition;
  sponsor_duration_days?: number; // Optional, defaults to config
}
Files: image files
Response: {
  success: boolean;
  data: CompanyPost;
  credits_deducted: number;
  remaining_balance: number;
}
```

### 4.3 Enhanced Retrieval APIs

#### 4.3.1 Updated Get Jobs API
```typescript
GET /api/jobs
Query: {
  page?: number;
  page_size?: number;
  search?: string;
  show_expired_sponsored?: boolean; // Default: false
}
// Response includes sponsored jobs at top (non-expired)
// Then regular jobs
```

#### 4.3.2 Updated Get Company Posts API
```typescript
GET /api/companies/:id/posts
Query: {
  page?: number;
  limit?: number;
  position?: PostPosition;
  show_expired_sponsored?: boolean; // Default: false
}
// Response prioritizes non-expired sponsored posts
```

## 5. Business Logic

### 5.1 Credit Deduction Flow
1. **Pre-validation**: Check if company has sufficient credits
2. **Content Creation**: Create job/post with `is_sponsored: true`
3. **Credit Deduction**: Update credit balance
4. **Order Logging**: Create order entry for audit
5. **Expiry Setting**: Set `expiry_date` based on configuration

### 5.2 Content Visibility Logic
1. **Active Sponsored Content**: `is_sponsored: true` AND `expiry_date > now()`
2. **Sorting Priority**: 
   - Active sponsored content first
   - Then regular content by creation date
3. **Expired Content**: Automatically becomes non-sponsored in queries

### 5.3 Credit Expiry Management
1. **Automatic Expiry**: Background job to check and handle expired credits
2. **Grace Period**: Consider 24-hour grace period for credit expiry
3. **Notification**: (Future) Notify companies about upcoming credit expiry

## 6. Error Handling

### 6.1 Credit-Related Errors
- **Insufficient Credits**: Clear error message with current balance
- **Expired Credits**: Prompt to purchase new credits
- **Invalid Company**: Company not found or not authorized

### 6.2 Validation Rules
- Credits must be positive integers
- Expiry date must be in the future
- Only AdminUsers can manage credits for their company
- Content can only be sponsored if company has active credits

## 7. Security & Authorization

### 7.1 Permission Matrix
| Action | AdminUser | Regular User | Admin |
|--------|-----------|--------------|-------|
| Assign Credits | ❌ | ❌ | ✅ |
| View Credit Balance | ✅ (own company) | ❌ | ✅ |
| Create Sponsored Content | ✅ (own company) | ❌ | ✅ |
| View Credit History | ✅ (own company) | ❌ | ✅ |

### 7.2 Rate Limiting
- Credit assignment: Admin-only, reasonable limits
- Sponsored content creation: Based on available credits

## 8. Implementation Phases

### Phase 1: Core Credit System (Week 1-2)
- [ ] Database migrations for Credit and Order models
- [ ] Credit assignment API
- [ ] Basic credit balance checking

### Phase 2: Sponsored Jobs (Week 2-3)
- [ ] Enhanced job creation with credit deduction
- [ ] Updated job retrieval with sponsored priority
- [ ] Credit deduction and order logging

### Phase 3: Sponsored Company Posts (Week 3-4)
- [ ] Enhanced company post creation with sponsorship
- [ ] Updated company post retrieval with sponsored priority
- [ ] Integration testing

### Phase 4: Configuration & Polish (Week 4)
- [ ] Configuration management for pricing/duration
- [ ] Error handling and validation
- [ ] API documentation
- [ ] Testing and bug fixes

## 9. Future Enhancements
- Homepage banners
- Featured listings
- Advanced analytics
- Automated credit purchase flow
- Credit expiry notifications
- A/B testing capabilities

---

## 10. Database Migration Scripts

### 10.1 Prisma Schema Changes
The following changes need to be made to `prisma/schema.prisma`:

```prisma
// Add new models
model Credit {
  id          String   @id @default(uuid())
  company_id  String
  balance     Int      @default(0)
  expiry_date DateTime
  start_date  DateTime @default(now())
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  company     Company  @relation(fields: [company_id], references: [id])
  
  @@unique([company_id])
}

model Order {
  id            String    @id @default(uuid())
  company_id    String
  type          OrderType
  date          DateTime  @default(now())
  credits_spent Int
  type_id       String    // ID of Job or CompanyPost
  created_at    DateTime  @default(now())
  company       Company   @relation(fields: [company_id], references: [id])
}

enum OrderType {
  COMPANY_POST
  JOB
  LISTING
}

// Update Company model to include relations
model Company {
  // ... existing fields
  credits Credit[]
  orders  Order[]
  // ... existing relations
}

// Update CompanyPost model
model CompanyPost {
  // ... existing fields
  expiry_date  DateTime? // NEW
  is_sponsored Boolean?  @default(false) // NEW
  // ... existing fields
}
```

### 10.2 Configuration File
Create `src/config/credit.config.ts`:

```typescript
export const CREDIT_CONFIG = {
  defaultExpiryDays: 30,
  creditPricing: {
    featuredJob: 250,
    featuredCompanyPost: 300,
  },
  visibilityDuration: {
    featuredJob: 7,
    featuredCompanyPost: 7,
  },
};
```

This PRD provides a comprehensive foundation for implementing the advertisement feature. The implementation should follow the phases outlined above for a structured development approach.
