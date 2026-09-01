-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "aadhaarNumber" TEXT,
ADD COLUMN     "altPhone" TEXT,
ADD COLUMN     "dob" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "isProfileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "panNumber" TEXT;
