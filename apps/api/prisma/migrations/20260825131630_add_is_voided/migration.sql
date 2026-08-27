-- DropIndex
DROP INDEX "Expense_status_idx";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "isVoided" BOOLEAN NOT NULL DEFAULT false;

-- Map existing CANCELLED status to isVoided
UPDATE "Expense" SET "isVoided" = true WHERE "status" = 'CANCELLED';

-- Drop the old column and type
ALTER TABLE "Expense" DROP COLUMN "status";
DROP TYPE "ExpenseStatus";
