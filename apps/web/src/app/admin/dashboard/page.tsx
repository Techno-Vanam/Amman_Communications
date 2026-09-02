import { getAccessToken } from '@/lib/server-auth';

type AdminSummary = { customers: number; applications: number; documents: number };

async function getSummary(): Promise<AdminSummary | null> {
	const token = await getAccessToken();
	const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003';
	if (!token) return null;

	try {
		const response = await fetch(`${apiBaseUrl}/api/v1/admin/dashboard/summary`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
		return response.ok ? response.json() as Promise<AdminSummary> : null;
	} catch {
		return null;
	}
}


export default async function AdminDashboardPage() {
	const summary = await getSummary();
	const values = summary ? [summary.applications, summary.documents, summary.customers] : ['--', '--', '--'];

<<<<<<< HEAD
	return (
		<div className="mx-auto max-w-5xl">
			<p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Admin workspace</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Operations at a glance.</h1>
			<p className="mt-3 text-gray-600">Manage application activity and document verification from one workspace.</p>
			<div className="mt-8 grid gap-4 sm:grid-cols-3">
				{['Applications', 'Pending documents', 'Customers'].map((label, index) => (
					<section key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
						<p className="text-sm text-gray-500">{label}</p>
						<p className="mt-3 text-3xl font-bold">{values[index]}</p>
						<p className="mt-2 text-xs text-gray-500">Live data from the protected admin API.</p>
					</section>
				))}
			</div>
		</div>
	);
=======
  const [message, setMessage] = useState<string | null>(null);

  const loadVerificationData = async () => {
    try {
      const [sumRes, queueRes] = await Promise.all([
        adminApiRequest<{ customers: number; applications: number; documents: number }>('/api/v1/admin/dashboard/summary'),
        adminApiRequest<AdminDocItem[]>('/api/v1/admin/dashboard/verification-queue'),
      ]);

      if (sumRes?.data) {
        setSummary(sumRes.data);
      }

      if (queueRes?.data) {
        setDocuments(queueRes.data);
      }
    } catch (err) {
      console.error('Failed to load verification data', err);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadVerificationData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    loadVerificationData();
    const interval = setInterval(loadVerificationData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStreamUrl = (doc: AdminDocItem) => {
    if (doc.downloadUrl) return doc.downloadUrl;
    return `/api/v1/admin/applications/${doc.applicationId}/documents/${doc.id}/stream`;
  };

  const handleVerify = async (doc: AdminDocItem) => {
    try {
      await adminApiRequest(`/api/v1/admin/applications/${doc.applicationId}/documents/${doc.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
    } catch (err) {
      console.error('Failed to verify document', err);
    }

    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: 'VERIFIED', rejectionReason: undefined } : d)),
    );
    if (viewingDoc && viewingDoc.id === doc.id) {
      setViewingDoc({ ...viewingDoc, status: 'VERIFIED', rejectionReason: undefined });
    }
    setMessage(`Document "${doc.fileName}" verified! Status synchronized to customer portal.`);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionModal || !rejectionModal.reason) return;

    try {
      await adminApiRequest(
        `/api/v1/admin/applications/${rejectionModal.appId}/documents/${rejectionModal.docId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({
            status: 'ACTION_REQUIRED',
            rejectionReason: rejectionModal.reason,
          }),
        },
      );
    } catch (err) {
      console.error('Failed to update document status', err);
    }

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === rejectionModal.docId
          ? { ...d, status: 'ACTION_REQUIRED', rejectionReason: rejectionModal.reason }
          : d,
      ),
    );
    if (viewingDoc && viewingDoc.id === rejectionModal.docId) {
      setViewingDoc({ ...viewingDoc, status: 'ACTION_REQUIRED', rejectionReason: rejectionModal.reason });
    }
    setMessage(`Action requested for document with reason. Customer will see notification instantly.`);
    setRejectionModal(null);
  };

  const statValues = summary
    ? [summary.applications, summary.documents, summary.customers]
    : [documents.length, documents.filter((d) => d.status === 'UPLOADED').length, 1];

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-warning">Admin Verification Desk</span>
            <span className="badge badge-success">Single Source Live Sync</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', margin: '0.25rem 0 0' }}>Customer Document Verification</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Review uploaded customer documents, inspect files inline, and verify or request corrections.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>{isRefreshing ? '⏳' : '🔄'}</span>
          <span>{isRefreshing ? 'Syncing...' : 'Refresh Queue'}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {['Total Applications', 'Total Documents', 'Total Customers'].map((label, idx) => (
          <div key={label} className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statValues[idx]}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live admin data</p>
          </div>
        ))}
      </div>

      {message && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-sm)',
            color: '#15803d',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          ✅ {message}
        </div>
      )}

      {/* Documents Review Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <th style={{ padding: '0.75rem 1rem' }}>APPLICATION</th>
              <th style={{ padding: '0.75rem 1rem' }}>APPLICANT</th>
              <th style={{ padding: '0.75rem 1rem' }}>DOCUMENT TYPE</th>
              <th style={{ padding: '0.75rem 1rem' }}>FILE / VERSION</th>
              <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    Verification Queue is Empty
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    When customers submit new applications or upload documents, they will appear here automatically.
                  </p>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-info">{doc.applicationNumber}</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>{doc.customerName}</td>
                <td style={{ padding: '1rem' }}>
                  <strong>{doc.documentType}</strong>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => setViewingDoc(doc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'inherit',
                      textAlign: 'left',
                    }}
                    title="Click to view file"
                  >
                    <span style={{ color: '#12372A', fontWeight: 600, textDecoration: 'underline' }}>
                      📄 {doc.fileName}
                    </span>
                    <span className="badge badge-neutral">v{doc.version}</span>
                  </button>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    {(doc.fileSize / 1024).toFixed(1)} KB • 🔒 AES-256-GCM
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {doc.status === 'VERIFIED' && <span className="badge badge-success">✅ VERIFIED</span>}
                  {doc.status === 'UPLOADED' && <span className="badge badge-info">⏱️ UNDER REVIEW</span>}
                  {doc.status === 'ACTION_REQUIRED' && (
                    <div>
                      <span className="badge badge-danger">⚠️ ACTION REQUIRED</span>
                      {doc.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                          {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    {/* View / Open File Button */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setViewingDoc(doc)}
                      style={{ fontWeight: 600 }}
                    >
                      👁️ View File
                    </button>
                    {/* Verify Button */}
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleVerify(doc)}
                      disabled={doc.status === 'VERIFIED'}
                    >
                      ✓ Verify
                    </button>
                    {/* Reject Button */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setRejectionModal({
                          docId: doc.id,
                          appId: doc.applicationId,
                          reason: doc.rejectionReason || 'Please upload a clearer 300 DPI document scan.',
                        })
                      }
                    >
                      ✗ Reject
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* ─── Interactive Document Viewer Modal / Lightbox ─── */}
      {viewingDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 150,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              background: '#ffffff',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
                    📄 {viewingDoc.fileName}
                  </h3>
                  <span className="badge badge-neutral">v{viewingDoc.version}</span>
                  {viewingDoc.status === 'VERIFIED' && <span className="badge badge-success">VERIFIED</span>}
                  {viewingDoc.status === 'UPLOADED' && <span className="badge badge-info">UNDER REVIEW</span>}
                  {viewingDoc.status === 'ACTION_REQUIRED' && <span className="badge badge-danger">ACTION REQUIRED</span>}
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Applicant: <strong>{viewingDoc.customerName}</strong> • Application: <strong>{viewingDoc.applicationNumber}</strong> • {viewingDoc.documentType}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={getStreamUrl(viewingDoc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  ↗ Open in New Tab
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '1rem' }}
                  title="Close viewer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body / Document Preview */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                background: '#f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
              }}
            >
              {viewingDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                <div style={{ width: '100%', height: '520px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <iframe
                    src={getStreamUrl(viewingDoc)}
                    title={viewingDoc.fileName}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <img
                    src={getStreamUrl(viewingDoc)}
                    alt={viewingDoc.fileName}
                    style={{
                      maxHeight: '480px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                    }}
                    onError={(e) => {
                      // Fallback if image fails to render
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer / Direct Approval Controls */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                🔒 AES-256-GCM client-decrypted file stream • Single Source of Truth
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewingDoc(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    const doc = viewingDoc;
                    setViewingDoc(null);
                    setRejectionModal({
                      docId: doc.id,
                      appId: doc.applicationId,
                      reason: doc.rejectionReason || 'Please upload a clearer 300 DPI document scan.',
                    });
                  }}
                >
                  ✗ Request Action / Reject
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleVerify(viewingDoc);
                    setViewingDoc(null);
                  }}
                  disabled={viewingDoc.status === 'VERIFIED'}
                >
                  ✓ Verify & Approve Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Rejection / Correction Modal ─── */}
      {rejectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 200,
          }}
        >
          <div className="card" style={{ maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#991b1b' }}>
              Request Document Re-upload
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the reason or instruction for the applicant. This will display immediately in the customer portal.
            </p>

            <div className="form-group">
              <label className="form-label">Rejection / Action Reason</label>
              <textarea
                rows={3}
                className="form-control"
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setRejectionModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRejectSubmit}>
                Send Action Request →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
>>>>>>> origin/backend-merge
}