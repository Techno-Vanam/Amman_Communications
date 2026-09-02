import { describe, it, expect, beforeEach } from 'vitest';
import { ApplicationsService } from '../src/applications/applications.service';
import { DocumentsService } from '../src/documents/documents.service';
import { StorageService } from '../src/storage/storage.service';

/**
 * In-memory Mock PrismaService for isolated, reliable synchronization & security testing.
 * Implements the exact relational rules, uniqueness constraint, and cascading ownership.
 */
class MockPrismaService {
  public customers: any[] = [];
  public applications: any[] = [];
  public documents: any[] = [];

  reset() {
    this.customers = [];
    this.applications = [];
    this.documents = [];
  }

  customer = {
    findUnique: async ({ where }: any) => {
      return this.customers.find((c) => (where.id ? c.id === where.id : c.email === where.email)) || null;
    },
    create: async ({ data }: any) => {
      const customer = { ...data, id: data.id || `cust_${Date.now()}_${Math.random().toString(36).substring(7)}`, createdAt: new Date(), updatedAt: new Date() };
      this.customers.push(customer);
      return customer;
    },
    update: async ({ where, data }: any) => {
      const index = this.customers.findIndex((c) => (where.id ? c.id === where.id : c.email === where.email));
      if (index === -1) throw new Error('Customer not found');
      this.customers[index] = { ...this.customers[index], ...data, updatedAt: new Date() };
      return this.customers[index];
    },
  };

  application = {
    findUnique: async ({ where, include }: any) => {
      const app = this.applications.find((a) => (where.id ? a.id === where.id : a.applicationNumber === where.applicationNumber));
      if (!app) return null;
      const res = { ...app };
      if (include?.documents) {
        res.documents = this.documents
          .filter((d) => d.applicationId === app.id)
          .sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());
      }
      if (include?.customer) {
        res.customer = this.customers.find((c) => c.id === app.customerId);
      }
      return res;
    },
    findMany: async ({ where, include, orderBy }: any) => {
      let list = this.applications.filter((a) => {
        if (where?.customerId && a.customerId !== where.customerId) return false;
        return true;
      });
      return list.map((app) => {
        const res = { ...app };
        if (include?.documents) {
          res.documents = this.documents
            .filter((d) => d.applicationId === app.id)
            .sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());
        }
        return res;
      });
    },
    create: async ({ data, include }: any) => {
      const app = {
        id: data.id || `app_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        applicationNumber: data.applicationNumber || `AMC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: data.customerId,
        title: data.title || null,
        serviceType: data.serviceType || null,
        status: data.status || 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.applications.push(app);
      const res = { ...app };
      if (include?.documents) {
        res.documents = [];
      }
      return res;
    },
    update: async ({ where, data, include }: any) => {
      const index = this.applications.findIndex((a) => a.id === where.id);
      if (index === -1) throw new Error('Application not found');
      this.applications[index] = { ...this.applications[index], ...data, updatedAt: new Date() };
      const res = { ...this.applications[index] };
      if (include?.documents) {
        res.documents = this.documents.filter((d) => d.applicationId === where.id);
      }
      return res;
    },
  };

  document = {
    findUnique: async ({ where, include }: any) => {
      let doc: any = null;
      if (where.id) {
        doc = this.documents.find((d) => d.id === where.id);
      } else if (where.applicationId_documentType) {
        doc = this.documents.find(
          (d) =>
            d.applicationId === where.applicationId_documentType.applicationId &&
            d.documentType === where.applicationId_documentType.documentType,
        );
      }
      if (!doc) return null;
      const res = { ...doc };
      if (include?.application) {
        res.application = this.applications.find((a) => a.id === doc.applicationId);
      }
      return res;
    },
    findMany: async ({ where }: any) => {
      return this.documents.filter((d) => {
        if (where?.applicationId && d.applicationId !== where.applicationId) return false;
        if (where?.customerId && d.customerId !== where.customerId) return false;
        return true;
      });
    },
    create: async ({ data }: any) => {
      // Enforce @@unique([applicationId, documentType]) constraint
      const existing = this.documents.find(
        (d) => d.applicationId === data.applicationId && d.documentType === data.documentType,
      );
      if (existing) {
        throw new Error('Unique constraint failed on the fields: (`applicationId`,`documentType`)');
      }

      const doc = {
        id: data.id || `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        customerId: data.customerId,
        applicationId: data.applicationId,
        documentType: data.documentType,
        originalFileName: data.originalFileName || data.fileName,
        fileName: data.fileName,
        storagePath: data.storagePath,
        fileUrl: data.fileUrl || null,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        status: data.status || 'UPLOADED',
        version: data.version || 1,
        rejectionReason: data.rejectionReason || null,
        verifiedAt: data.verifiedAt || null,
        verifiedBy: data.verifiedBy || null,
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };
      this.documents.push(doc);
      return doc;
    },
    update: async ({ where, data }: any) => {
      const index = this.documents.findIndex((d) => d.id === where.id);
      if (index === -1) throw new Error('Document not found');
      this.documents[index] = { ...this.documents[index], ...data, updatedAt: new Date() };
      return this.documents[index];
    },
    delete: async ({ where }: any) => {
      const index = this.documents.findIndex((d) => d.id === where.id);
      if (index === -1) throw new Error('Document not found');
      const removed = this.documents.splice(index, 1);
      return removed[0];
    },
  };
}

describe('MASTER SPECIFICATION — Application + Document Synchronization & Security Test Suite', () => {
  let mockPrisma: MockPrismaService;
  let storageService: StorageService;
  let applicationsService: ApplicationsService;
  let documentsService: DocumentsService;

  const customerA = { id: 'cust_A', email: 'customerA@test.com', name: 'Customer A' };
  const customerB = { id: 'cust_B', email: 'customerB@test.com', name: 'Customer B' };
  const adminUser = { id: 'admin_1', email: 'admin@amman.com', name: 'Admin Staff' };

  beforeEach(() => {
    mockPrisma = new MockPrismaService();
    mockPrisma.customers.push(customerA, customerB);

    storageService = new StorageService();
    storageService.onModuleInit(); // sets up local fallback mode

    applicationsService = new ApplicationsService(mockPrisma as any);
    documentsService = new DocumentsService(mockPrisma as any, storageService);
  });

  // ---------------------------------------------------------------------------
  // TEST 1 — Application → Documents (Single Source of Truth)
  // ---------------------------------------------------------------------------
  it('TEST 1: Upload from Application Form reflects same documentId in Document Upload Center', async () => {
    // 1. Create Application APP001 for Customer A
    const app = await applicationsService.createApplication(customerA.id, {
      applicationNumber: 'AMC-2026-000001',
      title: 'Business Visa Application',
    });
    expect(app.id).toBeDefined();

    // 2. Upload Passport from Application Form
    const uploadResult = await documentsService.uploadOrReplaceDocument(customerA.id, app.id, {
      documentType: 'PASSPORT',
      fileName: 'passport_scan.pdf',
      originalFileName: 'passport_scan.pdf',
      storagePath: `documents/${customerA.id}/${app.id}/PASSPORT_123_passport_scan.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024 * 500, // 500 KB
    });

    const docIdFromUpload = uploadResult.documentId;
    expect(docIdFromUpload).toBeDefined();

    // 3. Fetch application documents (Application view)
    const appDocuments = await documentsService.getDocumentsForApplication(customerA.id, app.id);
    expect(appDocuments.length).toBe(1);
    expect(appDocuments[0].documentType).toBe('PASSPORT');
    expect(appDocuments[0].documentId).toBe(docIdFromUpload);

    // 4. Open Document Upload Center (Grouped customer documents view)
    const docCenterGroups = await documentsService.getAllCustomerDocumentsGrouped(customerA.id);
    expect(docCenterGroups.length).toBe(1);
    expect(docCenterGroups[0].applicationId).toBe(app.id);
    expect(docCenterGroups[0].documents.length).toBe(1);

    // 5. Verify the EXACT SAME documentId is returned — NOT a parallel record
    const docCenterDoc = docCenterGroups[0].documents[0];
    expect(docCenterDoc.documentId).toBe(docIdFromUpload);
    expect(docCenterDoc.fileName).toBe('passport_scan.pdf');
    expect(docCenterDoc.status).toBe('UPLOADED');
  });

  // ---------------------------------------------------------------------------
  // TEST 2 — Documents → Application (Bi-directional Synchronization)
  // ---------------------------------------------------------------------------
  it('TEST 2: Upload from Document Center appears immediately in Application Details', async () => {
    // 1. Create Application APP001
    const app = await applicationsService.createApplication(customerA.id, {
      applicationNumber: 'AMC-2026-000002',
      title: 'Company Registration',
    });

    // 2. Upload Address Proof from Document Upload Center
    const uploadResult = await documentsService.uploadOrReplaceDocument(customerA.id, app.id, {
      documentType: 'ADDRESS_PROOF',
      fileName: 'utility_bill.pdf',
      originalFileName: 'utility_bill.pdf',
      storagePath: `documents/${customerA.id}/${app.id}/ADDRESS_PROOF_456_utility_bill.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024 * 300,
    });

    // 3. Fetch application documents — verify it exists
    const appDocs = await documentsService.getDocumentsForApplication(customerA.id, app.id);
    expect(appDocs.length).toBe(1);
    expect(appDocs[0].documentId).toBe(uploadResult.documentId);

    // 4. Fetch Application Details — verify document is nested and visible in Application details
    const appDetails = await applicationsService.getCustomerApplicationById(customerA.id, app.id);
    expect(appDetails.documents).toBeDefined();
    expect(appDetails.documents.length).toBe(1);
    expect(appDetails.documents[0].id).toBe(uploadResult.documentId);
    expect(appDetails.documents[0].documentType).toBe('ADDRESS_PROOF');
    expect(appDetails.documents[0].fileName).toBe('utility_bill.pdf');
  });

  // ---------------------------------------------------------------------------
  // TEST 3 — Document Replacement & Version Increment (Single Record Guarantee)
  // ---------------------------------------------------------------------------
  it('TEST 3: Re-uploading a document updates the single existing record, increments version, and stays in sync', async () => {
    const app = await applicationsService.createApplication(customerA.id, {
      applicationNumber: 'AMC-2026-000003',
      title: 'Residency Permit',
    });

    // 1. Initial upload of PASSPORT
    const initialUpload = await documentsService.uploadOrReplaceDocument(customerA.id, app.id, {
      documentType: 'PASSPORT',
      fileName: 'old_passport.pdf',
      originalFileName: 'old_passport.pdf',
      storagePath: `documents/${customerA.id}/${app.id}/PASSPORT_100_old_passport.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024 * 200,
    });
    const originalDocId = initialUpload.documentId;
    expect(initialUpload.version).toBe(1);

    // 2. Replace PASSPORT from Document Center / Form
    const replacedUpload = await documentsService.uploadOrReplaceDocument(customerA.id, app.id, {
      documentType: 'PASSPORT',
      fileName: 'new_renewed_passport.pdf',
      originalFileName: 'new_renewed_passport.pdf',
      storagePath: `documents/${customerA.id}/${app.id}/PASSPORT_200_new_renewed_passport.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024 * 450,
    });

    // 3. Document ID must remain the same, version must increment to 2
    expect(replacedUpload.documentId).toBe(originalDocId);
    expect(replacedUpload.version).toBe(2);
    expect(replacedUpload.fileName).toBe('new_renewed_passport.pdf');

    // 4. Verify database contains exactly ONE active record for (app.id, PASSPORT)
    const allDbDocs = mockPrisma.documents.filter(
      (d) => d.applicationId === app.id && d.documentType === 'PASSPORT',
    );
    expect(allDbDocs.length).toBe(1);
    expect(allDbDocs[0].id).toBe(originalDocId);
    expect(allDbDocs[0].version).toBe(2);

    // 5. Both Application Details and Document Center reflect the updated file
    const appDetails = await applicationsService.getCustomerApplicationById(customerA.id, app.id);
    expect(appDetails.documents[0].fileName).toBe('new_renewed_passport.pdf');
    expect(appDetails.documents[0].version).toBe(2);

    const docCenter = await documentsService.getAllCustomerDocumentsGrouped(customerA.id);
    expect(docCenter[0].documents[0].fileName).toBe('new_renewed_passport.pdf');
    expect(docCenter[0].documents[0].version).toBe(2);
  });

  // ---------------------------------------------------------------------------
  // TEST 4 — Status Synchronization (Admin Review -> Both Customer Views)
  // ---------------------------------------------------------------------------
  it('TEST 4: Admin status update propagates instantly to both Application and Document Center', async () => {
    const app = await applicationsService.createApplication(customerA.id, {
      applicationNumber: 'AMC-2026-000004',
      title: 'Trade License',
    });

    // 1. Customer uploads document
    const uploaded = await documentsService.uploadOrReplaceDocument(customerA.id, app.id, {
      documentType: 'TRADE_LICENSE',
      fileName: 'license_draft.pdf',
      storagePath: `documents/${customerA.id}/${app.id}/TRADE_LICENSE_1_license_draft.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024 * 150,
    });
    expect(uploaded.status).toBe('UPLOADED');

    // 2. Admin verifies the document
    const adminUpdate = await documentsService.adminUpdateDocumentStatus(
      adminUser.id,
      app.id,
      uploaded.documentId,
      { status: 'VERIFIED' as any },
    );
    expect(adminUpdate.status).toBe('VERIFIED');
    expect(adminUpdate.verifiedBy).toBe(adminUser.id);
    expect(adminUpdate.verifiedAt).toBeDefined();

    // 3. Customer fetches Application Details — status is VERIFIED
    const appDetails = await applicationsService.getCustomerApplicationById(customerA.id, app.id);
    expect(appDetails.documents[0].status).toBe('VERIFIED');

    // 4. Customer opens Document Upload Center — status is VERIFIED
    const docCenter = await documentsService.getAllCustomerDocumentsGrouped(customerA.id);
    expect(docCenter[0].documents[0].status).toBe('VERIFIED');

    // 5. Admin rejects with reason
    await documentsService.adminUpdateDocumentStatus(
      adminUser.id,
      app.id,
      uploaded.documentId,
      {
        status: 'ACTION_REQUIRED' as any,
        rejectionReason: 'The uploaded scan is blurry. Please provide a clear 300 DPI copy.',
      },
    );

    const appDetailsRejected = await applicationsService.getCustomerApplicationById(customerA.id, app.id);
    expect(appDetailsRejected.documents[0].status).toBe('ACTION_REQUIRED');
    expect(appDetailsRejected.documents[0].rejectionReason).toBe('The uploaded scan is blurry. Please provide a clear 300 DPI copy.');

    const docCenterRejected = await documentsService.getAllCustomerDocumentsGrouped(customerA.id);
    expect(docCenterRejected[0].documents[0].status).toBe('ACTION_REQUIRED');
    expect(docCenterRejected[0].documents[0].rejectionReason).toBe('The uploaded scan is blurry. Please provide a clear 300 DPI copy.');
  });

  // ---------------------------------------------------------------------------
  // TEST 5 — Security & IDOR Prevention
  // ---------------------------------------------------------------------------
  it('TEST 5: Cross-customer unauthorized access is strictly blocked (IDOR prevention)', async () => {
    // Customer A creates an application and uploads a sensitive document
    const appA = await applicationsService.createApplication(customerA.id, {
      applicationNumber: 'AMC-2026-CUSTOMER-A',
      title: 'Customer A Private Application',
    });

    const docA = await documentsService.uploadOrReplaceDocument(customerA.id, appA.id, {
      documentType: 'CONFIDENTIAL_BANK_STATEMENT',
      fileName: 'bank_statement.pdf',
      storagePath: `documents/${customerA.id}/${appA.id}/CONFIDENTIAL_1_bank.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024 * 100,
    });

    // 1. Customer B attempts to get Customer A's application details -> Forbidden
    await expect(
      applicationsService.getCustomerApplicationById(customerB.id, appA.id),
    ).rejects.toThrow('You do not have access to this application');

    // 2. Customer B attempts to list documents for Customer A's application -> Forbidden
    await expect(
      documentsService.getDocumentsForApplication(customerB.id, appA.id),
    ).rejects.toThrow('You do not have access to this application');

    // 3. Customer B attempts to get single document by ID -> Forbidden
    await expect(
      documentsService.getCustomerDocumentById(customerB.id, appA.id, docA.documentId),
    ).rejects.toThrow('You do not have access to this document');

    // 4. Customer B attempts to upload/replace document in Customer A's application -> Forbidden
    await expect(
      documentsService.uploadOrReplaceDocument(customerB.id, appA.id, {
        documentType: 'FORGED_DOC',
        fileName: 'malicious.pdf',
        storagePath: `documents/${customerB.id}/${appA.id}/FORGED_malicious.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1024 * 50,
      }),
    ).rejects.toThrow('You do not have access to this application');

    // 5. Customer B checks Document Upload Center -> Sees ONLY their own applications/documents
    const customerBDocCenter = await documentsService.getAllCustomerDocumentsGrouped(customerB.id);
    expect(customerBDocCenter.length).toBe(0);
  });
});
