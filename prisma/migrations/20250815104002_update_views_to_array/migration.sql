/*
  Warnings:

  - Changed the column `views` on the `Listing` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- Step 1: Add a temporary column for the new array type
ALTER TABLE "Listing" ADD COLUMN "views_new" "Views"[] DEFAULT ARRAY[]::"Views"[];

-- Step 2: Convert existing scalar values to arrays
UPDATE "Listing" 
SET "views_new" = ARRAY["views"]::"Views"[] 
WHERE "views" IS NOT NULL;

-- Step 3: Drop the old column
ALTER TABLE "Listing" DROP COLUMN "views";

-- Step 4: Rename the new column to the original name
ALTER TABLE "Listing" RENAME COLUMN "views_new" TO "views";

-- Step 5: Set the default value
ALTER TABLE "Listing" ALTER COLUMN "views" SET DEFAULT ARRAY[]::"Views"[];
