# Locality Mapping Scripts

This directory contains scripts and utilities for mapping localities to the 187 unique localities from `Unique_Localities.json`.

## 📁 Files Structure

### Utilities
- **`../utils/locality-mapping.ts`** - Reusable utility functions for locality mapping

### Scripts
- **`update-new-locality-187.ts`** - Processes only NEW records (without locality)
- **`update-existing-locality-187.ts`** - Processes ALL records (including existing ones)
- **`update-locality-187.ts`** - Original script (kept for reference)

## 🚀 Usage

### For New Data Only (Recommended)
```bash
# Process only records that don't have locality set
npx ts-node src/scripts/update-new-locality-187.ts
```

### For All Data (Use with caution)
```bash
# Process ALL records (including those with existing locality)
npx ts-node src/scripts/update-existing-locality-187.ts
```

## 🔧 Utility Functions

The `locality-mapping.ts` utility provides these functions:

### `mapToUniqueLocality(components: AddressComponent[]): string`
- Maps Google Maps address components to one of the 187 unique localities
- Returns the matched locality or "Other" if no match found

### `updateRecordLocality(updateData, recordId, recordType, prisma)`
- Updates a single listing or project with locality data
- Handles both listings and projects

### `getUniqueLocalities(): string[]`
- Returns the list of 187 unique localities

### `isUniqueLocality(locality: string): boolean`
- Checks if a locality exists in the unique localities list

## 📊 What Each Script Does

### New Data Script (`update-new-locality-187.ts`)
- ✅ **Only processes records where `locality` is `null`**
- ✅ **Safe for production** - won't overwrite existing data
- ✅ **Efficient** - processes only what's needed
- ✅ **Perfect for new data** - run this when new listings/projects are added

### Existing Data Script (`update-existing-locality-187.ts`)
- ⚠️ **Processes ALL records** (including those with existing locality)
- ⚠️ **Will overwrite existing locality data**
- ⚠️ **Use with caution** - only run when you want to refresh all localities
- ⚠️ **Resource intensive** - processes every record in the database

## 🎯 Recommended Workflow

1. **For new data**: Use `update-new-locality-187.ts` regularly
2. **For one-time migration**: Use `update-existing-locality-187.ts` once
3. **For ongoing maintenance**: Use `update-new-locality-187.ts` for new records

## 🔍 How It Works

1. **Fetches records** based on script type (new vs all)
2. **Geocodes addresses** using Google Maps API
3. **Maps localities** to the 187 unique localities using `mapToUniqueLocality`
4. **Updates database** with coordinates, formatted address, and mapped locality
5. **Handles errors gracefully** and continues processing

## ⚡ Performance Notes

- **Rate limiting**: 100ms delay between API calls
- **Error handling**: Continues processing even if individual records fail
- **Logging**: Detailed progress and error reporting
- **Efficiency**: New data script only processes what's needed
