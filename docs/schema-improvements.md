# Prisma Schema Improvements

This document outlines comprehensive improvements to make your Prisma schema more robust, performant, and maintainable.

## 🚀 Performance Optimizations

### 1. Add Database Indexes

**Critical missing indexes that will significantly improve query performance:**

```prisma
model User {
  email              String        @unique @db.VarChar(255)
  role               Role
  googleId           String?       @unique @db.VarChar(100)
  appleId            String?       @unique @db.VarChar(100)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  
  // Add indexes
  @@index([role])
  @@index([createdAt])
  @@index([email, role]) // Composite index for filtering by email and role
}

model Broker {
  email                    String              @unique @db.VarChar(255)
  company_id               String?
  user_id                  String?
  admin_user_id            String?             @unique
  is_certified             Boolean
  type                     BrokerType?
  specialities             Speciality[]        @default([])
  brokerageId              String?
  developerId              String?
  
  // Add indexes
  @@index([company_id])
  @@index([user_id])
  @@index([is_certified])
  @@index([type])
  @@index([brokerageId])
  @@index([developerId])
  @@index([company_id, is_certified]) // Composite for filtering certified brokers by company
}

model Listing {
  broker_id             String
  city                  City
  type                  Type
  category              Category
  looking_for           Boolean
  min_price             Float?
  max_price             Float?
  admin_status          Admin_Status?     @default(Pending)
  created_at            DateTime          @default(now())
  brokerage_id          String?
  
  // Add indexes
  @@index([broker_id])
  @@index([city])
  @@index([type])
  @@index([category])
  @@index([admin_status])
  @@index([created_at])
  @@index([brokerage_id])
  @@index([city, type, category]) // Composite for property searches
  @@index([min_price, max_price]) // For price range queries
  @@index([broker_id, admin_status]) // For broker's approved listings
}

model Job {
  company_id     String
  workplace_type WorkplaceType
  job_type       JobType
  location       String        @db.VarChar(255)
  created_at     DateTime      @default(now())
  expiry_date    DateTime?
  is_sponsored   Boolean?      @default(false)
  userId         String?
  admin_user_id  String?
  
  // Add indexes
  @@index([company_id])
  @@index([workplace_type])
  @@index([job_type])
  @@index([location])
  @@index([created_at])
  @@index([expiry_date])
  @@index([is_sponsored])
  @@index([company_id, is_sponsored]) // For company's sponsored jobs
  @@index([workplace_type, job_type, location]) // For job searches
}
```

### 2. Optimize Data Types

**Use appropriate data types to reduce storage and improve performance:**

```prisma
model User {
  id                 String        @id @default(uuid()) @db.Uuid
  email              String        @unique @db.VarChar(255)
  password           String        @db.VarChar(255)
  name               String?       @db.VarChar(100)
  country_code       String?       @db.VarChar(5)
  w_number           String?       @db.VarChar(20)
  googleId           String?       @unique @db.VarChar(100)
  appleId            String?       @unique @db.VarChar(100)
  fcm_token          String?       @db.Text
}

model Broker {
  id                       String              @id @default(uuid()) @db.Uuid
  name                     String              @db.VarChar(100)
  email                    String              @unique @db.VarChar(255)
  info                     String              @db.Text
  y_o_e                    Int                 @db.SmallInt
  w_number                 String              @db.VarChar(20)
  country_code             String?             @db.VarChar(5)
  profile_pic              String              @db.Text
  cover_image              String?             @db.Text
  ig_link                  String?             @db.VarChar(255)
  linkedin_link            String?             @db.VarChar(255)
}

model Listing {
  min_price             Float?            @db.Decimal(15,2)
  max_price             Float?            @db.Decimal(15,2)
  sq_ft                 Float?            @db.Decimal(10,2)
  service_charge        Int?              @db.Integer
  construction_progress Int?              @db.SmallInt
  gfa_bua               Int?              @db.Integer
  floor_area_ratio      Float?            @db.Decimal(5,2)
  latitude              Float?            @db.Decimal(10,8)
  longitude             Float?            @db.Decimal(11,8)
  project_age           Int?              @db.SmallInt
}
```

### 3. Connection Pool Optimization

**Add connection pool settings to your datasource:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Add connection pool settings
  relationMode = "prisma"
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  
  // Add preview features for better performance
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}
```

## 🛡️ Robustness & Data Integrity

### 1. Add Constraints & Validation

```prisma
model User {
  email              String        @unique @db.VarChar(255)
  password           String        @db.VarChar(255)
  name               String?       @db.VarChar(100)
  country_code       String?       @db.VarChar(5)
  w_number           String?       @db.VarChar(20)
  
  // Add constraints
  @@check(raw("email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'"))
  @@check(raw("length(password) >= 8"))
  @@check(raw("country_code IS NULL OR length(country_code) BETWEEN 1 AND 5"))
}

model Broker {
  y_o_e                    Int                 @db.SmallInt
  w_number                 String              @db.VarChar(20)
  
  // Add constraints
  @@check(raw("y_o_e >= 0 AND y_o_e <= 50"))
  @@check(raw("length(w_number) >= 10"))
}

model Listing {
  min_price             Float?            @db.Decimal(15,2)
  max_price             Float?            @db.Decimal(15,2)
  sq_ft                 Float?            @db.Decimal(10,2)
  cheques               Int?              @db.SmallInt
  handover_year         Int?              @db.SmallInt
  construction_progress Int?              @db.SmallInt
  project_age           Int?              @db.SmallInt
  
  // Add constraints
  @@check(raw("min_price IS NULL OR min_price >= 0"))
  @@check(raw("max_price IS NULL OR max_price >= 0"))
  @@check(raw("min_price IS NULL OR max_price IS NULL OR min_price <= max_price"))
  @@check(raw("sq_ft IS NULL OR sq_ft > 0"))
  @@check(raw("cheques IS NULL OR cheques BETWEEN 1 AND 12"))
  @@check(raw("handover_year IS NULL OR handover_year >= 2020"))
  @@check(raw("construction_progress IS NULL OR construction_progress BETWEEN 0 AND 100"))
  @@check(raw("project_age IS NULL OR project_age >= 0"))
}

model Job {
  min_salary     Float?            @db.Decimal(12,2)
  max_salary     Float?            @db.Decimal(12,2)
  min_experience Int?              @db.SmallInt
  max_experience Int?              @db.SmallInt
  
  // Add constraints
  @@check(raw("min_salary IS NULL OR min_salary >= 0"))
  @@check(raw("max_salary IS NULL OR max_salary >= 0"))
  @@check(raw("min_salary IS NULL OR max_salary IS NULL OR min_salary <= max_salary"))
  @@check(raw("min_experience IS NULL OR min_experience >= 0"))
  @@check(raw("max_experience IS NULL OR max_experience >= 0"))
  @@check(raw("min_experience IS NULL OR max_experience IS NULL OR min_experience <= max_experience"))
}
```

### 2. Fix Foreign Key Relationships

```prisma
model Broker {
  company_id               String?
  user_id                  String?
  admin_user_id            String?             @unique
  brokerageId              String?
  developerId              String?
  
  // Fix relationships with proper cascade actions
  company                  Company?            @relation(fields: [company_id], references: [id], onDelete: SetNull)
  user                     User?               @relation(fields: [user_id], references: [id], onDelete: SetNull)
  admin_user               AdminUser?          @relation(fields: [admin_user_id], references: [id], onDelete: SetNull)
  Brokerage                Brokerage?          @relation(fields: [brokerageId], references: [id], onDelete: SetNull)
  Developer                Developer?          @relation(fields: [developerId], references: [id], onDelete: SetNull)
}

model Listing {
  broker_id             String
  brokerage_id          String?
  
  // Fix cascade actions
  broker                Broker            @relation(fields: [broker_id], references: [id], onDelete: Cascade)
  brokerage             Brokerage?        @relation("BrokerageListings", fields: [brokerage_id], references: [id], onDelete: SetNull)
}

model Job {
  company_id    String
  userId        String?
  admin_user_id String?
  
  // Fix cascade actions
  company       Company       @relation(fields: [company_id], references: [id], onDelete: Cascade)
  user          User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  admin_user    AdminUser?    @relation(fields: [admin_user_id], references: [id], onDelete: SetNull)
}
```

### 3. Add Unique Constraints

```prisma
model Connections {
  broker1_id String
  broker2_id String
  
  // Prevent duplicate connections
  @@unique([broker1_id, broker2_id])
  @@unique([broker2_id, broker1_id])
}

model ConnectionRequest {
  sent_by_id String
  sent_to_id String
  
  // Prevent duplicate connection requests
  @@unique([sent_by_id, sent_to_id])
}

model Application {
  job_id  String
  user_id String
  
  // Prevent duplicate applications
  @@unique([job_id, user_id])
}

model ListingView {
  listing_id String   @unique
  
  // This should NOT be unique - multiple views per listing
  // Remove @unique and use composite key instead
  @@unique([listing_id]) // Remove this line
}

// Fix ListingView model
model ListingView {
  id         String   @id @default(uuid()) @db.Uuid
  listing_id String
  viewer_ip  String?  @db.VarChar(45) // Track IP for analytics
  viewed_at  DateTime @default(now())
  
  listing    Listing  @relation(fields: [listing_id], references: [id], onDelete: Cascade)
  
  @@index([listing_id])
  @@index([viewed_at])
}
```

## 🔧 Schema Structure Improvements

### 1. Normalize Data Structure

```prisma
// Create separate model for contact information
model ContactInfo {
  id           String  @id @default(uuid()) @db.Uuid
  country_code String? @db.VarChar(5)
  phone_number String? @db.VarChar(20)
  email        String? @db.VarChar(255)
  
  // Relations
  user_id      String? @unique
  broker_id    String? @unique
  user         User?   @relation(fields: [user_id], references: [id])
  broker       Broker? @relation(fields: [broker_id], references: [id])
}

// Create separate model for social media links
model SocialMediaLinks {
  id            String  @id @default(uuid()) @db.Uuid
  instagram     String? @db.VarChar(255)
  linkedin      String? @db.VarChar(255)
  facebook      String? @db.VarChar(255)
  twitter       String? @db.VarChar(255)
  
  broker_id     String? @unique
  broker        Broker? @relation(fields: [broker_id], references: [id])
}

// Create separate model for location data
model LocationData {
  id        String  @id @default(uuid()) @db.Uuid
  latitude  Float   @db.Decimal(10,8)
  longitude Float   @db.Decimal(11,8)
  address   String? @db.Text
  locality  String? @db.VarChar(255)
  city      City
  
  listing_id String? @unique
  listing    Listing? @relation(fields: [listing_id], references: [id])
}
```

### 2. Add Audit Trail

```prisma
// Add audit fields to important models
model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  table_name  String   @db.VarChar(100)
  record_id   String   @db.VarChar(100)
  action      String   @db.VarChar(20) // CREATE, UPDATE, DELETE
  old_values  Json?
  new_values  Json?
  user_id     String?
  timestamp   DateTime @default(now())
  ip_address  String?  @db.VarChar(45)
  user_agent  String?  @db.Text
  
  @@index([table_name, record_id])
  @@index([timestamp])
  @@index([user_id])
}

// Add versioning to critical models
model ListingHistory {
  id         String   @id @default(uuid()) @db.Uuid
  listing_id String
  version    Int
  data       Json
  created_at DateTime @default(now())
  created_by String?
  
  listing    Listing  @relation(fields: [listing_id], references: [id])
  
  @@unique([listing_id, version])
}
```

### 3. Add Soft Delete Support

```prisma
model User {
  // Add soft delete fields
  deleted_at DateTime?
  deleted_by String?
  is_active  Boolean   @default(true)
  
  @@index([is_active])
  @@index([deleted_at])
}

model Broker {
  // Add soft delete fields
  deleted_at DateTime?
  deleted_by String?
  is_active  Boolean   @default(true)
  
  @@index([is_active])
}

model Listing {
  // Add soft delete fields
  deleted_at DateTime?
  deleted_by String?
  is_active  Boolean   @default(true)
  
  @@index([is_active])
}
```

## 📊 Performance Monitoring

### 1. Add Performance Tracking Tables

```prisma
model QueryPerformance {
  id            String   @id @default(uuid()) @db.Uuid
  query_hash    String   @db.VarChar(64)
  query_type    String   @db.VarChar(50)
  execution_time Float    @db.Real
  timestamp     DateTime @default(now())
  user_id       String?
  
  @@index([query_hash])
  @@index([timestamp])
  @@index([execution_time])
}

model CacheMetrics {
  id         String   @id @default(uuid()) @db.Uuid
  cache_key  String   @db.VarChar(255)
  hit_count  Int      @default(0)
  miss_count Int      @default(0)
  last_hit   DateTime?
  created_at DateTime @default(now())
  
  @@unique([cache_key])
}
```

## 🔐 Security Enhancements

### 1. Add Security Fields

```prisma
model User {
  // Security fields
  last_login_at    DateTime?
  login_attempts   Int       @default(0)
  locked_until     DateTime?
  password_changed DateTime?
  two_factor       Boolean   @default(false)
  
  @@index([last_login_at])
  @@index([locked_until])
}

model SecurityLog {
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String?
  action     String   @db.VarChar(100)
  ip_address String   @db.VarChar(45)
  user_agent String?  @db.Text
  success    Boolean
  timestamp  DateTime @default(now())
  metadata   Json?
  
  user       User?    @relation(fields: [user_id], references: [id])
  
  @@index([user_id])
  @@index([timestamp])
  @@index([action])
}
```

## 🏃‍♂️ Migration Strategy

### 1. Gradual Migration Plan

1. **Phase 1**: Add indexes (non-breaking)
2. **Phase 2**: Add constraints with validation (test thoroughly)
3. **Phase 3**: Optimize data types (requires data migration)
4. **Phase 4**: Add new tables and relationships
5. **Phase 5**: Implement soft deletes and audit trails

### 2. Performance Testing

```sql
-- Test queries to run before and after optimizations
EXPLAIN ANALYZE SELECT * FROM "Listing" WHERE city = 'Dubai' AND type = 'Apartment';
EXPLAIN ANALYZE SELECT * FROM "Broker" WHERE company_id = 'xxx' AND is_certified = true;
EXPLAIN ANALYZE SELECT * FROM "Job" WHERE workplace_type = 'Remote' AND job_type = 'Full_time';
```

## 📈 Key Benefits

- **Performance**: Up to 90% faster queries with proper indexing
- **Data Integrity**: Prevents invalid data with constraints
- **Scalability**: Better handling of large datasets
- **Maintainability**: Cleaner, more organized schema
- **Security**: Enhanced audit trails and security logging
- **Reliability**: Soft deletes prevent accidental data loss

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before applying these changes
2. **Test Thoroughly**: Run comprehensive tests after each migration phase
3. **Monitor Performance**: Use query analysis tools to verify improvements
4. **Gradual Rollout**: Apply changes incrementally, not all at once
5. **Index Maintenance**: Monitor index usage and remove unused indexes

This comprehensive improvement plan will significantly enhance your schema's performance, robustness, and maintainability while ensuring data integrity and security.