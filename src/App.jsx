
import React, { useState, useEffect, createContext, useContext } from 'react';

// --- Global Constants & Mock Data ---

const CLAIM_STATUSES = {
    DRAFT: 'Draft',
    INTAKE_REVIEW: 'Intake Review',
    DOCS_PENDING: 'Documents Pending',
    VALIDATION_PENDING: 'Validation Pending',
    EXAMINER_REVIEW: 'Examiner Review',
    LEGAL_REVIEW: 'Legal Review',
    COMPLIANCE_REVIEW: 'Compliance Review',
    UNDERWRITING_REVIEW: 'Underwriting Review',
    BENEFIT_CALC: 'Benefit Calculation',
    APPROVAL_LEVEL_1: 'Approval Level 1',
    APPROVAL_LEVEL_2: 'Approval Level 2',
    APPROVAL_LEVEL_3: 'Approval Level 3',
    FINANCE_PENDING: 'Finance Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CLOSED: 'Closed',
    EXCEPTION: 'Exception',
};

const CLAIM_STATUS_MAP = {
    [CLAIM_STATUSES.APPROVED]: 'approved',
    [CLAIM_STATUSES.FINANCE_PENDING]: 'in-progress',
    [CLAIM_STATUSES.INTAKE_REVIEW]: 'in-progress',
    [CLAIM_STATUSES.DOCS_PENDING]: 'pending',
    [CLAIM_STATUSES.VALIDATION_PENDING]: 'pending',
    [CLAIM_STATUSES.EXAMINER_REVIEW]: 'in-progress',
    [CLAIM_STATUSES.LEGAL_REVIEW]: 'in-progress',
    [CLAIM_STATUSES.COMPLIANCE_REVIEW]: 'in-progress',
    [CLAIM_STATUSES.UNDERWRITING_REVIEW]: 'in-progress',
    [CLAIM_STATUSES.BENEFIT_CALC]: 'in-progress',
    [CLAIM_STATUSES.APPROVAL_LEVEL_1]: 'in-progress',
    [CLAIM_STATUSES.APPROVAL_LEVEL_2]: 'in-progress',
    [CLAIM_STATUSES.APPROVAL_LEVEL_3]: 'in-progress',
    [CLAIM_STATUSES.REJECTED]: 'rejected',
    [CLAIM_STATUSES.EXCEPTION]: 'exception',
    [CLAIM_STATUSES.DRAFT]: 'pending',
    [CLAIM_STATUSES.CLOSED]: 'approved',
};

const CLAIM_TYPES = [
    'Life death claim',
    'Accidental death benefit claim',
    'Terminal illness benefit claim',
    'Annuity withdrawal claim',
    'Annuity maturity payout',
    'Beneficiary claim',
    'Surrender / partial surrender request',
    'Rider benefit claim',
    'Waiver / exception-based claim',
    'Reopened claim',
    'Appeal / reconsideration request',
];

const ROLES = {
    CLAIMANT: 'Claimant',
    CALL_CENTER: 'Call Center Agent',
    INTAKE_SPECIALIST: 'Intake Specialist',
    CLAIMS_EXAMINER: 'Claims Examiner',
    SENIOR_ADJUDICATOR: 'Senior Claims Adjudicator',
    MEDICAL_REVIEWER: 'Medical / Legal / Compliance Reviewer',
    UNDERWRITER: 'Underwriting / Policy Validation Specialist',
    SUPERVISOR: 'Supervisor / Team Lead / Approval Manager',
    FINANCE: 'Finance / Disbursement Officer',
    DOC_VERIFIER: 'Document Verification Specialist',
    OPS_ADMIN: 'Operations Admin / Workflow Configurator',
    EXECUTIVE: 'Executive / Business Leader',
};

const USER_DATA = [
    { id: 'usr-001', name: 'Alice Johnson', role: ROLES.EXECUTIVE, avatar: 'https://i.pravatar.cc/32?u=alice' },
    { id: 'usr-002', name: 'Bob Smith', role: ROLES.SUPERVISOR, avatar: 'https://i.pravatar.cc/32?u=bob' },
    { id: 'usr-003', name: 'Charlie Brown', role: ROLES.CLAIMS_EXAMINER, avatar: 'https://i.pravatar.cc/32?u=charlie' },
    { id: 'usr-004', name: 'Diana Prince', role: ROLES.INTAKE_SPECIALIST, avatar: 'https://i.pravatar.cc/32?u=diana' },
    { id: 'usr-005', name: 'Eve Adams', role: ROLES.FINANCE, avatar: 'https://i.pravatar.cc/32?u=eve' },
    { id: 'usr-006', name: 'Frank White', role: ROLES.CLAIMANT, avatar: 'https://i.pravatar.cc/32?u=frank' },
    { id: 'usr-007', name: 'Grace Lee', role: ROLES.DOC_VERIFIER, avatar: 'https://i.pravatar.cc/32?u=grace' },
];

const APPROVAL_MATRIX = [
    { amountThreshold: 10000, roles: [ROLES.CLAIMS_EXAMINER] },
    { amountThreshold: 50000, roles: [ROLES.CLAIMS_EXAMINER, ROLES.SUPERVISOR] },
    { amountThreshold: 100000, roles: [ROLES.CLAIMS_EXAMINER, ROLES.SUPERVISOR, ROLES.SENIOR_ADJUDICATOR] },
    { amountThreshold: 250000, roles: [ROLES.CLAIMS_EXAMINER, ROLES.SUPERVISOR, ROLES.SENIOR_ADJUDICATOR, ROLES.FINANCE] },
    { amountThreshold: Infinity, roles: [ROLES.CLAIMS_EXAMINER, ROLES.SUPERVISOR, ROLES.SENIOR_ADJUDICATOR, ROLES.FINANCE, ROLES.EXECUTIVE] },
];

const DOC_TEMPLATES = {
    'Life death claim': ['Death Certificate', 'Claimant ID', 'Policy Document', 'Beneficiary Proof'],
    'Annuity withdrawal claim': ['Withdrawal Form', 'ID Proof', 'Bank Account Proof'],
    'Accidental death benefit claim': ['Death Certificate', 'Accident Report', 'Police Report', 'Claimant ID'],
};

const WORKFLOW_MILESTONES = [
    { id: 'intake', label: 'Claim Intake', status: [CLAIM_STATUSES.INTAKE_REVIEW, CLAIM_STATUSES.DOCS_PENDING, CLAIM_STATUSES.DRAFT] },
    { id: 'validation', label: 'Validation', status: [CLAIM_STATUSES.VALIDATION_PENDING] },
    { id: 'adjudication', label: 'Adjudication', status: [CLAIM_STATUSES.EXAMINER_REVIEW, CLAIM_STATUSES.LEGAL_REVIEW, CLAIM_STATUSES.COMPLIANCE_REVIEW, CLAIM_STATUSES.UNDERWRITING_REVIEW, CLAIM_STATUSES.BENEFIT_CALC] },
    { id: 'approval', label: 'Approval', status: [CLAIM_STATUSES.APPROVAL_LEVEL_1, CLAIM_STATUSES.APPROVAL_LEVEL_2, CLAIM_STATUSES.APPROVAL_LEVEL_3] },
    { id: 'disbursement', label: 'Disbursement', status: [CLAIM_STATUSES.FINANCE_PENDING] },
    { id: 'closed', label: 'Closed', status: [CLAIM_STATUSES.APPROVED, CLAIM_STATUSES.CLOSED, CLAIM_STATUSES.REJECTED, CLAIM_STATUSES.EXCEPTION] },
];


let CLAIMS_DATA_SEED = [
    {
        id: 'CLM-2024-001',
        type: 'Life death claim',
        status: CLAIM_STATUSES.APPROVAL_LEVEL_2,
        insuredName: 'John Doe',
        claimantName: 'Jane Doe',
        submissionDate: '2024-03-01',
        eventDate: '2024-02-15',
        payoutAmount: 75000,
        assignedTo: 'usr-003',
        policyNumber: 'LP87654321',
        riskScore: 'High',
        slaStatus: 'On Track',
        documents: [
            { id: 'doc-001', name: 'Death Certificate.pdf', status: 'Accepted', uploadedBy: 'usr-006', uploadedDate: '2024-03-01', category: 'Mandatory', deficiency: null },
            { id: 'doc-002', name: 'Claimant ID.png', status: 'Pending', uploadedBy: 'usr-006', uploadedDate: '2024-03-01', category: 'Mandatory', deficiency: null },
        ],
        auditLog: [
            { id: 'aud-001', timestamp: '2024-03-01T10:00:00Z', user: 'System', action: 'Claim Created', details: 'Claim initiated via claimant portal.' },
            { id: 'aud-002', timestamp: '2024-03-01T10:05:00Z', user: 'usr-004', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.INTAKE_REVIEW}.` },
            { id: 'aud-003', timestamp: '2024-03-02T11:20:00Z', user: 'usr-004', action: 'Document Uploaded', details: 'Death Certificate.pdf accepted.' },
            { id: 'aud-004', timestamp: '2024-03-03T09:30:00Z', user: 'usr-003', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.EXAMINER_REVIEW}.` },
            { id: 'aud-005', timestamp: '2024-03-05T14:00:00Z', user: 'usr-003', action: 'Review Complete', details: 'Examiner review passed to Level 1 Approval.' },
            { id: 'aud-006', timestamp: '2024-03-06T10:00:00Z', user: 'usr-002', action: 'Approval Action', details: 'Supervisor approved (Level 1).' },
        ],
        notes: [{ id: 'note-001', user: 'usr-003', timestamp: '2024-03-03T09:45:00Z', comment: 'Waiting for Claimant ID verification before proceeding.' }],
        currentApprovers: ['usr-002'],
        approvalHistory: [{ level: 1, approver: 'usr-003', decision: 'Approved', timestamp: '2024-03-06T10:00:00Z', comment: 'All documents verified and benefit calculated correctly.' }],
    },
    {
        id: 'CLM-2024-002',
        type: 'Annuity withdrawal claim',
        status: CLAIM_STATUSES.DOCS_PENDING,
        insuredName: 'Alice Wonderland',
        claimantName: 'Alice Wonderland',
        submissionDate: '2024-03-05',
        eventDate: '2024-03-01',
        payoutAmount: 15000,
        assignedTo: 'usr-004',
        policyNumber: 'AN12345678',
        riskScore: 'Medium',
        slaStatus: 'Approaching SLA',
        documents: [
            { id: 'doc-003', name: 'Withdrawal Form.pdf', status: 'Accepted', uploadedBy: 'usr-006', uploadedDate: '2024-03-05', category: 'Mandatory', deficiency: null },
        ],
        auditLog: [
            { id: 'aud-007', timestamp: '2024-03-05T11:00:00Z', user: 'usr-004', action: 'Claim Created', details: 'Claim initiated by Call Center Agent.' },
            { id: 'aud-008', timestamp: '2024-03-05T11:10:00Z', user: 'usr-004', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.DOCS_PENDING}. Missing ID Proof.` },
        ],
        notes: [{ id: 'note-002', user: 'usr-004', timestamp: '2024-03-05T11:15:00Z', comment: 'Contacted claimant for ID proof.' }],
        currentApprovers: [],
        approvalHistory: [],
    },
    {
        id: 'CLM-2024-003',
        type: 'Terminal illness benefit claim',
        status: CLAIM_STATUSES.APPROVED,
        insuredName: 'Bruce Wayne',
        claimantName: 'Alfred Pennyworth',
        submissionDate: '2024-02-10',
        eventDate: '2024-02-01',
        payoutAmount: 500000,
        assignedTo: 'usr-005',
        policyNumber: 'TI98765432',
        riskScore: 'Low',
        slaStatus: 'Completed',
        documents: [],
        auditLog: [
            { id: 'aud-009', timestamp: '2024-02-10T09:00:00Z', user: 'System', action: 'Claim Created', details: 'Claim initiated via API.' },
            { id: 'aud-010', timestamp: '2024-02-28T16:00:00Z', user: 'usr-001', action: 'Approval Action', details: 'Executive approved (Final Level).' },
            { id: 'aud-011', timestamp: '2024-02-29T10:00:00Z', user: 'usr-005', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.APPROVED}.` },
        ],
        notes: [],
        currentApprovers: [],
        approvalHistory: [],
    },
    {
        id: 'CLM-2024-004',
        type: 'Beneficiary claim',
        status: CLAIM_STATUSES.REJECTED,
        insuredName: 'Clark Kent',
        claimantName: 'Lois Lane',
        submissionDate: '2024-01-20',
        eventDate: '2024-01-10',
        payoutAmount: 0,
        assignedTo: 'usr-003',
        policyNumber: 'BC55544433',
        riskScore: 'Low',
        slaStatus: 'Completed',
        documents: [],
        auditLog: [
            { id: 'aud-012', timestamp: '2024-01-20T14:00:00Z', user: 'usr-004', action: 'Claim Created', details: 'Claim initiated by Call Center Agent.' },
            { id: 'aud-013', timestamp: '2024-01-25T10:00:00Z', user: 'usr-003', action: 'Approval Action', details: 'Examiner rejected due to policy exclusions.' },
            { id: 'aud-014', timestamp: '2024-01-25T10:05:00Z', user: 'usr-003', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.REJECTED}.` },
        ],
        notes: [{ id: 'note-003', user: 'usr-003', timestamp: '2024-01-25T10:00:00Z', comment: 'Policy exclusion for this event was active. Claim rejected.' }],
        currentApprovers: [],
        approvalHistory: [{ level: 1, approver: 'usr-003', decision: 'Rejected', timestamp: '2024-01-25T10:00:00Z', comment: 'Policy exclusion active.' }],
    },
    {
        id: 'CLM-2024-005',
        type: 'Life death claim',
        status: CLAIM_STATUSES.FINANCE_PENDING,
        insuredName: 'Diana Prince',
        claimantName: 'Steve Trevor',
        submissionDate: '2024-03-10',
        eventDate: '2024-03-05',
        payoutAmount: 200000,
        assignedTo: 'usr-005',
        policyNumber: 'LP11223344',
        riskScore: 'Medium',
        slaStatus: 'On Track',
        documents: [
            { id: 'doc-004', name: 'Death Certificate.pdf', status: 'Accepted', uploadedBy: 'usr-006', uploadedDate: '2024-03-10', category: 'Mandatory', deficiency: null },
            { id: 'doc-005', name: 'Claimant ID.png', status: 'Accepted', uploadedBy: 'usr-006', uploadedDate: '2024-03-10', category: 'Mandatory', deficiency: null },
            { id: 'doc-006', name: 'Policy Document.pdf', status: 'Accepted', uploadedBy: 'usr-006', uploadedDate: '2024-03-10', category: 'Mandatory', deficiency: null },
            { id: 'doc-007', name: 'Beneficiary Proof.pdf', status: 'Accepted', uploadedBy: 'usr-006', uploadedDate: '2024-03-10', category: 'Mandatory', deficiency: null },
        ],
        auditLog: [
            { id: 'aud-015', timestamp: '2024-03-10T09:00:00Z', user: 'System', action: 'Claim Created', details: 'Claim initiated via portal.' },
            { id: 'aud-016', timestamp: '2024-03-10T09:15:00Z', user: 'usr-004', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.INTAKE_REVIEW}.` },
            { id: 'aud-017', timestamp: '2024-03-11T10:00:00Z', user: 'usr-004', action: 'Document Verification', details: 'All mandatory documents verified.' },
            { id: 'aud-018', timestamp: '2024-03-12T11:00:00Z', user: 'usr-003', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.EXAMINER_REVIEW}.` },
            { id: 'aud-019', timestamp: '2024-03-13T14:00:00Z', user: 'usr-003', action: 'Benefit Calculation', details: 'Benefit calculated as $200,000.' },
            { id: 'aud-020', timestamp: '2024-03-14T09:00:00Z', user: 'usr-002', action: 'Approval Action', details: 'Supervisor approved (Level 1).' },
            { id: 'aud-021', timestamp: '2024-03-15T10:00:00Z', user: 'usr-002', action: 'Approval Action', details: 'Supervisor approved (Level 2).' },
            { id: 'aud-022', timestamp: '2024-03-16T11:00:00Z', user: 'usr-005', action: 'Status Update', details: `Status changed to ${CLAIM_STATUSES.FINANCE_PENDING}.` },
        ],
        notes: [],
        currentApprovers: ['usr-005'],
        approvalHistory: [
            { level: 1, approver: 'usr-003', decision: 'Approved', timestamp: '2024-03-14T09:00:00Z', comment: 'All good to proceed.' },
            { level: 2, approver: 'usr-002', decision: 'Approved', timestamp: '2024-03-15T10:00:00Z', comment: 'Managerial approval for payout.' }
        ],
    },
];

const AppContext = createContext();

// --- Reusable UI Components ---

const StatusChip = ({ status }) => {
    const statusClass = CLAIM_STATUS_MAP[status] || 'pending';
    const statusText = status;
    return (
        <span className={`status-chip status-${statusClass}`}>
            <span className={`status-dot`} style={{ backgroundColor: `var(--status-${statusClass}-border)` }}></span>
            {statusText}
        </span>
    );
};

const Card = ({ children, onClick, className = '', style = {} }) => {
    return (
        <div
            className={`card ${onClick ? 'card-clickable' : ''} ${className}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
};

const Header = ({ currentUser, navigateTo, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // In a real app, this would trigger a global search API call
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <header className="app-header">
            <div className="flex items-center">
                <div className="logo">L&A Claims</div>
                <nav className="main-nav">
                    <a href="#" className="nav-item active" onClick={() => navigateTo({ screen: 'DASHBOARD' })}>Dashboard</a>
                    <a href="#" className="nav-item" onClick={() => navigateTo({ screen: 'CLAIMS_LIST' })}>Claims</a>
                    {currentUser?.role === ROLES.OPS_ADMIN && (
                         <a href="#" className="nav-item" onClick={() => navigateTo({ screen: 'ADMIN_SETTINGS' })}>Admin</a>
                    )}
                </nav>
            </div>
            <div className="app-header-actions">
                <div className="global-search-container">
                    <input
                        type="text"
                        placeholder="Global Search Claims, Policies..."
                        className="global-search-input"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <button aria-label="Notifications">🔔</button>
                <button aria-label="Settings">⚙️</button>
                <div className="user-profile">
                    <img src={currentUser?.avatar || 'https://i.pravatar.cc/32'} alt={currentUser?.name} />
                    <span>{currentUser?.name}</span>
                </div>
            </div>
        </header>
    );
};

const Breadcrumbs = ({ path, navigateTo }) => {
    return (
        <nav className="breadcrumbs" aria-label="breadcrumb">
            {path.map((item, index) => (
                <React.Fragment key={item.label}>
                    <a
                        href="#"
                        className={`breadcrumb-item ${index === path.length - 1 ? 'active' : ''}`}
                        onClick={() => item.onClick ? item.onClick() : navigateTo(item.view)}
                    >
                        {item.label}
                    </a>
                    {index < path.length - 1 && <span className="breadcrumb-separator">/</span>}
                </React.Fragment>
            ))}
        </nav>
    );
};

const MilestoneTracker = ({ currentStatus }) => {
    const findCurrentMilestoneIndex = () => {
        for (let i = 0; i < WORKFLOW_MILESTONES.length; i++) {
            if (WORKFLOW_MILESTONES[i].status.includes(currentStatus)) {
                return i;
            }
        }
        return 0; // Default to first milestone
    };

    const currentMilestoneIndex = findCurrentMilestoneIndex();

    return (
        <div className="milestone-tracker card" style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
            {WORKFLOW_MILESTONES.map((milestone, index) => {
                const isCompleted = index < currentMilestoneIndex;
                const isCurrent = index === currentMilestoneIndex;
                const milestoneClass = isCompleted ? 'completed' : (isCurrent ? 'current' : '');

                return (
                    <div key={milestone.id} className={`milestone-step ${milestoneClass}`}>
                        <div className="milestone-icon">
                            {isCompleted ? '✓' : (isCurrent ? '●' : index + 1)}
                        </div>
                        <div className="milestone-label">{milestone.label}</div>
                        {index < WORKFLOW_MILESTONES.length - 1 && (
                            <div className="milestone-line">
                                <div className="milestone-line-progress" style={{ width: isCompleted || isCurrent ? '100%' : '0%' }}></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AuditFeed = ({ auditLog }) => {
    const sortedLog = [...auditLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return (
        <Card>
            <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-lg)' }}>Recent Activities</h3>
            <div className="audit-feed">
                {sortedLog?.map(entry => (
                    <div key={entry.id} className="audit-feed-item">
                        <div className="audit-feed-icon">📝</div>
                        <div className="audit-feed-content">
                            <strong>{entry.action}</strong> by {USER_DATA.find(u => u.id === entry.user)?.name || entry.user}
                            <p style={{ margin: '0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{entry.details}</p>
                            <span className="audit-feed-timestamp">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// --- Screen Components ---

const DashboardScreen = ({ currentUser, navigateTo }) => {
    const getClaimsByStatus = (status) => CLAIMS_DATA_SEED.filter(c => c.status === status);
    const getClaimsByAssignedTo = (userId) => CLAIMS_DATA_SEED.filter(c => c.assignedTo === userId);
    const getClaimsNearingSLA = () => CLAIMS_DATA_SEED.filter(c => c.slaStatus === 'Approaching SLA');

    const renderExecutiveDashboard = () => (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Executive Dashboard</h2>
            <div className="card-grid">
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST' })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Total Claims Submitted</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{CLAIMS_DATA_SEED.length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>📈 +5% from last month</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.APPROVED } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Approved Claims</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.APPROVED).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🟢 {((getClaimsByStatus(CLAIM_STATUSES.APPROVED).length / CLAIMS_DATA_SEED.length) * 100 || 0).toFixed(1)}% Approval Rate</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.FINANCE_PENDING } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Pending Payouts</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.FINANCE_PENDING).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>💸 Total: ${getClaimsByStatus(CLAIM_STATUSES.FINANCE_PENDING).reduce((sum, claim) => sum + claim.payoutAmount, 0).toLocaleString()}</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { riskScore: 'High' } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>High Risk Claims</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{CLAIMS_DATA_SEED.filter(c => c.riskScore === 'High').length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🚨 Requires immediate attention</span>
                </Card>
            </div>

            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>Claims by Type</h4>
                    <div className="chart-container">Bar Chart Placeholder</div>
                </Card>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>SLA Breach Trends</h4>
                    <div className="chart-container">Line Chart Placeholder</div>
                </Card>
            </div>
        </>
    );

    const renderSupervisorDashboard = () => (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Supervisor Dashboard</h2>
            <div className="card-grid">
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { assignedTo: currentUser?.id } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>My Team Workload</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{CLAIMS_DATA_SEED.filter(c => USER_DATA.find(u => u.id === c.assignedTo)?.role === ROLES.CLAIMS_EXAMINER).length} Claims</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>📊 Avg: 3.5 claims/examiner</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { statuses: [CLAIM_STATUSES.APPROVAL_LEVEL_1, CLAIM_STATUSES.APPROVAL_LEVEL_2, CLAIM_STATUSES.APPROVAL_LEVEL_3] } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Pending Approvals</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{CLAIMS_DATA_SEED.filter(c => c.status.includes('Approval Level')).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>⏳ Overdue: 2</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { slaStatus: 'Approaching SLA' } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Claims Nearing SLA</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsNearingSLA().length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>⚠️ Critical: 1</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { payoutAmountThreshold: 100000 } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>High Value Claims</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{CLAIMS_DATA_SEED.filter(c => c.payoutAmount >= 100000).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>💰 &gt; $100k claims</span>
                </Card>
            </div>
            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>Team Performance</h4>
                    <div className="chart-container">Bar Chart Placeholder</div>
                </Card>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>Aging Buckets</h4>
                    <div className="chart-container">Donut Chart Placeholder</div>
                </Card>
            </div>
        </>
    );

    const renderExaminerDashboard = () => (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Examiner Dashboard</h2>
            <div className="card-grid">
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { assignedTo: currentUser?.id } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>My Queue</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByAssignedTo(currentUser?.id).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🎯 Claims assigned to you</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { assignedTo: currentUser?.id, status: CLAIM_STATUSES.DOCS_PENDING } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Missing Documents</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByAssignedTo(currentUser?.id).filter(c => c.status === CLAIM_STATUSES.DOCS_PENDING).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>📝 Follow up required</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { assignedTo: currentUser?.id, slaStatus: 'Approaching SLA' } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Nearing SLA Breach</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByAssignedTo(currentUser?.id).filter(c => c.slaStatus === 'Approaching SLA').length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>⏰ Act now!</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_REGISTRATION' })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>New Claim Intake</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>+</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>Start a new claim process</span>
                </Card>
            </div>
            <Card>
                <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-lg)' }}>Recent Assigned Claims</h3>
                <ClaimListTable claims={getClaimsByAssignedTo(currentUser?.id)} navigateTo={navigateTo} />
            </Card>
        </>
    );

    const renderIntakeDashboard = () => (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Intake Specialist Dashboard</h2>
            <div className="card-grid">
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.INTAKE_REVIEW } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>New Claims Received</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.INTAKE_REVIEW).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🆕 Fresh claims for review</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.DOCS_PENDING } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Incomplete Submissions</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.DOCS_PENDING).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>❌ Missing crucial info</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.VALIDATION_PENDING } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Validation Failures</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>0</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🚫 Policy/Claim mismatch</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_REGISTRATION' })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Start New Claim</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>+</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>Agent-assisted claim entry</span>
                </Card>
            </div>
            <Card>
                <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-lg)' }}>Claims in Intake Queue</h3>
                <ClaimListTable claims={CLAIMS_DATA_SEED.filter(c => c.status === CLAIM_STATUSES.INTAKE_REVIEW || c.status === CLAIM_STATUSES.DOCS_PENDING)} navigateTo={navigateTo} />
            </Card>
        </>
    );

    const renderFinanceDashboard = () => (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Finance Dashboard</h2>
            <div className="card-grid">
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.FINANCE_PENDING } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Approved Payouts Awaiting Payment</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.FINANCE_PENDING).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>💲 Total: ${getClaimsByStatus(CLAIM_STATUSES.FINANCE_PENDING).reduce((sum, claim) => sum + claim.payoutAmount, 0).toLocaleString()}</span>
                </Card>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Payment Exceptions</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>0</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🚧 Failed disbursements</span>
                </Card>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Daily Payout Total (Today)</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>$0</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>📈 Target: $500k</span>
                </Card>
                <Card>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Tax Deduction Summary</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>$0</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>💸 YTD: $1.2M</span>
                </Card>
            </div>
            <Card>
                <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-lg)' }}>Pending Disbursements</h3>
                <ClaimListTable claims={getClaimsByStatus(CLAIM_STATUSES.FINANCE_PENDING)} navigateTo={navigateTo} />
            </Card>
        </>
    );

    const renderComplianceFraudDashboard = () => (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Compliance & Fraud Dashboard</h2>
            <div className="card-grid">
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { flagged: true } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>AML / Sanctions Matches</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>0</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🚨 Critical alerts</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { riskScore: 'High' } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Suspicious Claims</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{CLAIMS_DATA_SEED.filter(c => c.riskScore === 'High').length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>🕵️‍♀️ Under investigation</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.LEGAL_REVIEW } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Claims Under Legal Review</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.LEGAL_REVIEW).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>⚖️ Legal counsel engaged</span>
                </Card>
                <Card onClick={() => navigateTo({ screen: 'CLAIMS_LIST', params: { status: CLAIM_STATUSES.COMPLIANCE_REVIEW } })}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>Compliance Alerts</h4>
                    <p style={{ margin: '0', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{getClaimsByStatus(CLAIM_STATUSES.COMPLIANCE_REVIEW).length}</p>
                    <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>⚠️ Regulatory flags</span>
                </Card>
            </div>
            <Card>
                <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-lg)' }}>Flagged Claims for Review</h3>
                <ClaimListTable claims={CLAIMS_DATA_SEED.filter(c => c.riskScore === 'High' || c.status === CLAIM_STATUSES.LEGAL_REVIEW || c.status === CLAIM_STATUSES.COMPLIANCE_REVIEW)} navigateTo={navigateTo} />
            </Card>
        </>
    );

    const renderDefaultDashboard = () => (
        <EmptyState
            icon="📊"
            title="Welcome to your Dashboard!"
            message="Your personalized insights will appear here based on your role and permissions. Explore claims or submit a new one."
            actionButton={{ label: 'View All Claims', onClick: () => navigateTo({ screen: 'CLAIMS_LIST' }) }}
        />
    );


    switch (currentUser?.role) {
        case ROLES.EXECUTIVE: return renderExecutiveDashboard();
        case ROLES.SUPERVISOR: return renderSupervisorDashboard();
        case ROLES.CLAIMS_EXAMINER: return renderExaminerDashboard();
        case ROLES.INTAKE_SPECIALIST: return renderIntakeDashboard();
        case ROLES.FINANCE: return renderFinanceDashboard();
        case ROLES.MEDICAL_REVIEWER: // For simplicity, combine with Compliance/Fraud for dashboard view
        case ROLES.UNDERWRITER:
        case ROLES.DOC_VERIFIER:
        case ROLES.OPS_ADMIN: // Ops Admin might have a more configuration-focused dashboard
        case ROLES.CALL_CENTER:
        case ROLES.SENIOR_ADJUDICATOR: // Senior Adjudicator could be a supervisor-like dashboard
        case ROLES.CLAIMANT: // Claimant needs a specific portal view, simplified here.
        // If COMPLIANCE_REVIEWER is a distinct role, add it explicitly
        // If not, it falls through to a default or is handled by a combined dashboard.
        // Assuming MEDICAL_REVIEWER covers compliance/legal for dashboard view based on WORKFLOW_MILESTONES/ROLE structure.
        // Added an explicit case for compliance related roles
        case 'Compliance Reviewer': // Assuming this might be the string if it's not exactly MEDICAL_REVIEWER or a different constant.
            return renderComplianceFraudDashboard();
        default: return renderDefaultDashboard();
    }
};

const EmptyState = ({ icon, title, message, actionButton }) => (
    <div className="empty-state">
        <span className="empty-state-icon">{icon}</span>
        <h3>{title}</h3>
        <p>{message}</p>
        {actionButton && (
            <button className="button button-primary" onClick={actionButton.onClick}>
                {actionButton.label}
            </button>
        )}
    </div>
);


const ClaimListTable = ({ claims, navigateTo }) => {
    if (claims.length === 0) {
        return (
            <EmptyState
                icon="🗄️"
                title="No Claims Found"
                message="It looks like there are no claims matching your current criteria. Try adjusting your filters or create a new claim."
                actionButton={{ label: 'Register New Claim', onClick: () => navigateTo({ screen: 'CLAIMS_REGISTRATION' }) }}
            />
        );
    }

    return (
        <Card style={{ padding: '0' }}>
            <table className="data-grid">
                <thead>
                    <tr>
                        <th>Claim ID</th>
                        <th>Claim Type</th>
                        <th>Insured Name</th>
                        <th>Claimant</th>
                        <th>Status</th>
                        <th>Payout Amount</th>
                        <th>Assigned To</th>
                        <th>SLA Status</th>
                    </tr>
                </thead>
                <tbody>
                    {claims?.map(claim => (
                        <tr key={claim.id} onClick={() => navigateTo({ screen: 'CLAIM_DETAIL', params: { claimId: claim.id } })}>
                            <td>{claim.id}</td>
                            <td>{claim.type}</td>
                            <td>{claim.insuredName}</td>
                            <td>{claim.claimantName}</td>
                            <td><StatusChip status={claim.status} /></td>
                            <td>${claim.payoutAmount?.toLocaleString()}</td>
                            <td>{USER_DATA.find(u => u.id === claim.assignedTo)?.name || 'N/A'}</td>
                            <td>{claim.slaStatus}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

const ClaimsListScreen = ({ navigateTo, params }) => {
    const [filterTerm, setFilterTerm] = useState(params?.searchTerm || '');
    const [currentFilters, setCurrentFilters] = useState(params);
    const [sortKey, setSortKey] = useState('submissionDate');
    const [sortDirection, setSortDirection] = useState('desc');

    const filteredClaims = CLAIMS_DATA_SEED.filter(claim => {
        // Apply text search
        const matchesSearch = filterTerm
            ? Object.values(claim).some(val =>
                String(val).toLowerCase().includes(filterTerm.toLowerCase())
            )
            : true;

        // Apply dynamic filters from currentFilters
        const matchesFilters = Object.entries(currentFilters).every(([key, value]) => {
            if (!value) return true; // Skip empty filters

            if (key === 'status') {
                return claim.status === value;
            }
            if (key === 'statuses') { // For array of statuses
                return Array.isArray(value) ? value.includes(claim.status) : claim.status === value;
            }
            if (key === 'assignedTo') {
                return claim.assignedTo === value;
            }
            if (key === 'riskScore') {
                return claim.riskScore === value;
            }
            if (key === 'slaStatus') {
                return claim.slaStatus === value;
            }
            if (key === 'payoutAmountThreshold') {
                return claim.payoutAmount >= value;
            }
            if (key === 'type') {
                return claim.type === value;
            }
            if (key === 'flagged') {
                return claim.riskScore === 'High' || claim.status === CLAIM_STATUSES.LEGAL_REVIEW || claim.status === CLAIM_STATUSES.COMPLIANCE_REVIEW;
            }
            return true; // Default to true if filter key not explicitly handled
        });

        return matchesSearch && matchesFilters;
    }).sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleFilterChange = (key, value) => {
        setCurrentFilters(prevFilters => ({
            ...prevFilters,
            [key]: value
        }));
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    return (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>All Claims</h2>
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex justify-between items-center mb-md">
                    <input
                        type="text"
                        placeholder="Search claims..."
                        className="form-input"
                        style={{ width: '300px' }}
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                    />
                    <button className="button button-primary" onClick={() => navigateTo({ screen: 'CLAIMS_REGISTRATION' })}>
                        + Register New Claim
                    </button>
                </div>
                <div className="flex gap-md mb-md">
                    <div className="form-group" style={{ marginBottom: '0', width: '200px' }}>
                        <label className="form-label">Status</label>
                        <select className="form-select" value={currentFilters?.status || ''} onChange={(e) => handleFilterChange('status', e.target.value)}>
                            <option value="">All Statuses</option>
                            {Object.values(CLAIM_STATUSES).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0', width: '200px' }}>
                        <label className="form-label">Claim Type</label>
                        <select className="form-select" value={currentFilters?.type || ''} onChange={(e) => handleFilterChange('type', e.target.value)}>
                            <option value="">All Types</option>
                            {CLAIM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0', width: '200px' }}>
                        <label className="form-label">Assigned To</label>
                        <select className="form-select" value={currentFilters?.assignedTo || ''} onChange={(e) => handleFilterChange('assignedTo', e.target.value)}>
                            <option value="">Anyone</option>
                            {USER_DATA.filter(u => u.role !== ROLES.CLAIMANT).map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </div>
                    <button className="button button-secondary" onClick={() => setCurrentFilters({})}>Clear Filters</button>
                </div>
            </Card>

            <ClaimListTable claims={filteredClaims} navigateTo={navigateTo} />
        </>
    );
};

const ClaimRegistrationScreen = ({ navigateTo, currentUser }) => {
    const [formData, setFormData] = useState({
        id: `CLM-${new Date().getFullYear()}-${String(CLAIMS_DATA_SEED.length + 1).padStart(3, '0')}`,
        type: '',
        insuredName: '',
        claimantName: '',
        submissionDate: new Date().toISOString().split('T')[0],
        eventDate: '',
        payoutAmount: 0,
        assignedTo: '',
        policyNumber: '',
        riskScore: 'Low',
        slaStatus: 'On Track',
        documents: [],
        auditLog: [],
        notes: [],
        currentApprovers: [],
        approvalHistory: [],
    });
    const [errors, setErrors] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.type) newErrors.type = 'Claim Type is required';
        if (!formData.insuredName) newErrors.insuredName = 'Insured Name is required';
        if (!formData.claimantName) newErrors.claimantName = 'Claimant Name is required';
        if (!formData.policyNumber) newErrors.policyNumber = 'Policy Number is required';
        if (!formData.eventDate) newErrors.eventDate = 'Event Date is required';
        if (formData.payoutAmount <= 0) newErrors.payoutAmount = 'Payout Amount must be greater than 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files.map(file => ({
            name: file.name,
            file: file,
            status: 'Pending',
            uploadedBy: currentUser?.id,
            uploadedDate: new Date().toISOString().split('T')[0],
            category: 'Ad-hoc', // Default
            deficiency: null
        }))]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const newClaim = {
                ...formData,
                documents: uploadedFiles,
                status: CLAIM_STATUSES.INTAKE_REVIEW,
                auditLog: [
                    { id: `aud-${Date.now()}`, timestamp: new Date().toISOString(), user: currentUser?.id || 'System', action: 'Claim Created', details: 'Claim initiated via registration form.' }
                ],
                assignedTo: currentUser?.id || 'usr-004', // Assign to Intake Specialist by default
            };
            CLAIMS_DATA_SEED = [...CLAIMS_DATA_SEED, newClaim];
            alert(`Claim ${newClaim.id} registered successfully!`);
            navigateTo({ screen: 'CLAIM_DETAIL', params: { claimId: newClaim.id } });
        } else {
            alert('Please correct the errors in the form.');
        }
    };

    return (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Register New Claim</h2>
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-lg">
                        <div className="form-group">
                            <label className="form-label">Claim ID</label>
                            <input type="text" className="form-input" value={formData.id} readOnly />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Claim Type <span style={{ color: 'var(--color-red-600)' }}>*</span></label>
                            <select
                                name="type"
                                className="form-select"
                                value={formData.type}
                                onChange={handleChange}
                                style={{ borderColor: errors.type ? 'var(--color-red-600)' : '' }}
                            >
                                <option value="">Select Claim Type</option>
                                {CLAIM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            {errors.type && <p className="error-message">{errors.type}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Insured Name <span style={{ color: 'var(--color-red-600)' }}>*</span></label>
                            <input
                                type="text"
                                name="insuredName"
                                className="form-input"
                                value={formData.insuredName}
                                onChange={handleChange}
                                style={{ borderColor: errors.insuredName ? 'var(--color-red-600)' : '' }}
                            />
                            {errors.insuredName && <p className="error-message">{errors.insuredName}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Claimant Name <span style={{ color: 'var(--color-red-600)' }}>*</span></label>
                            <input
                                type="text"
                                name="claimantName"
                                className="form-input"
                                value={formData.claimantName}
                                onChange={handleChange}
                                style={{ borderColor: errors.claimantName ? 'var(--color-red-600)' : '' }}
                            />
                            {errors.claimantName && <p className="error-message">{errors.claimantName}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Policy Number <span style={{ color: 'var(--color-red-600)' }}>*</span></label>
                            <input
                                type="text"
                                name="policyNumber"
                                className="form-input"
                                value={formData.policyNumber}
                                onChange={handleChange}
                                style={{ borderColor: errors.policyNumber ? 'var(--color-red-600)' : '' }}
                            />
                            {errors.policyNumber && <p className="error-message">{errors.policyNumber}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Event Date <span style={{ color: 'var(--color-red-600)' }}>*</span></label>
                            <input
                                type="date"
                                name="eventDate"
                                className="form-input"
                                value={formData.eventDate}
                                onChange={handleChange}
                                style={{ borderColor: errors.eventDate ? 'var(--color-red-600)' : '' }}
                            />
                            {errors.eventDate && <p className="error-message">{errors.eventDate}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payout Amount ($) <span style={{ color: 'var(--color-red-600)' }}>*</span></label>
                            <input
                                type="number"
                                name="payoutAmount"
                                className="form-input"
                                value={formData.payoutAmount}
                                onChange={handleChange}
                                style={{ borderColor: errors.payoutAmount ? 'var(--color-red-600)' : '' }}
                            />
                            {errors.payoutAmount && <p className="error-message">{errors.payoutAmount}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Submission Date</label>
                            <input type="date" className="form-input" value={formData.submissionDate} readOnly />
                        </div>

                    </div>
                    <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <label className="form-label">Upload Supporting Documents</label>
                        <input type="file" multiple className="form-input" onChange={handleFileChange} />
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            {uploadedFiles.map((file, index) => (
                                <p key={index} style={{ margin: 'var(--spacing-xs) 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    {file.name} - ({file.status})
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <button type="button" className="button button-secondary" onClick={() => navigateTo({ screen: 'CLAIMS_LIST' })}>
                            Cancel
                        </button>
                        <button type="submit" className="button button-primary">
                            Register Claim
                        </button>
                    </div>
                </form>
            </Card>
        </>
    );
};


const ClaimDetailScreen = ({ navigateTo, params, currentUser, updateClaim }) => {
    const claimId = params.claimId;
    const claim = CLAIMS_DATA_SEED.find(c => c.id === claimId);
    const [activeTab, setActiveTab] = useState('summary');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'approve', 'reject', 'request_info'
    const [actionComment, setActionComment] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);

    if (!claim) {
        return <EmptyState
            icon="❓"
            title="Claim Not Found"
            message={`The claim with ID ${claimId} could not be found. It might have been deleted or never existed.`}
            actionButton={{ label: 'Back to Claims List', onClick: () => navigateTo({ screen: 'CLAIMS_LIST' }) }}
        />;
    }

    const assignedExaminer = USER_DATA.find(u => u.id === claim.assignedTo);

    const getRequiredDocs = (claimType) => DOC_TEMPLATES[claimType] || [];
    const requiredDocs = getRequiredDocs(claim.type);
    const uploadedDocs = claim.documents || [];

    const handleActionClick = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const getApproversForStatus = (status, amount) => {
        if (status.startsWith('Approval Level')) {
            const requiredRoles = APPROVAL_MATRIX.find(matrix => amount <= matrix.amountThreshold)?.roles;
            // Get the role corresponding to the current approval level
            const approvalMilestone = WORKFLOW_MILESTONES.find(m => m.id === 'approval');
            const approvalLevelIndex = approvalMilestone?.status.indexOf(status);

            if (approvalLevelIndex !== -1 && requiredRoles && approvalLevelIndex < requiredRoles.length) {
                const targetRole = requiredRoles[approvalLevelIndex];
                return USER_DATA.filter(u => u.role === targetRole).map(u => u.id);
            }
        } else if (status === CLAIM_STATUSES.FINANCE_PENDING) {
            return USER_DATA.filter(u => u.role === ROLES.FINANCE).map(u => u.id);
        }
        return [];
    };

    const handleModalSubmit = () => {
        // Implement claim update logic
        let newStatus = claim.status;
        let newAuditEntry = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.id,
            action: '',
            details: actionComment,
        };
        let newApprovalEntry = null;
        let nextApprovers = [];

        if (modalType === 'approve') {
            const approvalMilestone = WORKFLOW_MILESTONES.find(m => m.id === 'approval');
            const currentApprovalLevelIndex = approvalMilestone?.status.indexOf(claim.status);

            if (currentApprovalLevelIndex !== undefined && currentApprovalLevelIndex !== -1 && (currentApprovalLevelIndex + 1) < approvalMilestone.status.length) {
                newStatus = approvalMilestone.status[currentApprovalLevelIndex + 1];
                newAuditEntry.action = `Approved (Level ${currentApprovalLevelIndex + 1})`;
                newApprovalEntry = {
                    level: currentApprovalLevelIndex + 1,
                    approver: currentUser?.name,
                    decision: 'Approved',
                    timestamp: new Date().toISOString(),
                    comment: actionComment
                };
            } else {
                newStatus = CLAIM_STATUSES.FINANCE_PENDING; // Final approval goes to finance
                newAuditEntry.action = `Approved (Final)`;
                newApprovalEntry = {
                    level: 'Final',
                    approver: currentUser?.name,
                    decision: 'Approved',
                    timestamp: new Date().toISOString(),
                    comment: actionComment
                };
            }
            nextApprovers = getApproversForStatus(newStatus, claim.payoutAmount);

        } else if (modalType === 'reject') {
            newStatus = CLAIM_STATUSES.REJECTED;
            newAuditEntry.action = 'Claim Rejected';
            newApprovalEntry = {
                level: 'N/A',
                approver: currentUser?.name,
                decision: 'Rejected',
                timestamp: new Date().toISOString(),
                comment: actionComment
            };
            nextApprovers = []; // No new approvers on rejection
        } else if (modalType === 'request_info') {
            newStatus = CLAIM_STATUSES.DOCS_PENDING; // Or a specific status for info request
            newAuditEntry.action = 'Requested Additional Information';
            // Optionally, reassign to intake specialist or original claimant for document upload
            nextApprovers = [];
        }

        updateClaim(claim.id, {
            status: newStatus,
            auditLog: [...claim.auditLog, newAuditEntry],
            approvalHistory: newApprovalEntry ? [...(claim.approvalHistory || []), newApprovalEntry] : claim.approvalHistory,
            currentApprovers: nextApprovers
        });

        setShowModal(false);
        setActionComment('');
    };


    // RBAC for actions
    const canApprove = (currentUser?.role === ROLES.CLAIMS_EXAMINER && claim.status === CLAIM_STATUSES.EXAMINER_REVIEW) ||
                      (currentUser?.role === ROLES.SUPERVISOR && claim.status === CLAIM_STATUSES.APPROVAL_LEVEL_1) ||
                      (currentUser?.role === ROLES.SENIOR_ADJUDICATOR && claim.status === CLAIM_STATUSES.APPROVAL_LEVEL_2) ||
                      (currentUser?.role === ROLES.EXECUTIVE && claim.status === CLAIM_STATUSES.APPROVAL_LEVEL_3) || // Executive for final approval level
                      (currentUser?.role === ROLES.FINANCE && claim.status === CLAIM_STATUSES.FINANCE_PENDING); // Finance can "approve" by disbursing

    const canReject = [ROLES.CLAIMS_EXAMINER, ROLES.SUPERVISOR, ROLES.SENIOR_ADJUDICATOR, ROLES.FINANCE, ROLES.EXECUTIVE].includes(currentUser?.role);
    const canRequestInfo = [ROLES.CLAIMS_EXAMINER, ROLES.INTAKE_SPECIALIST, ROLES.DOC_VERIFIER].includes(currentUser?.role);
    const canEditDocuments = [ROLES.DOC_VERIFIER, ROLES.INTAKE_SPECIALIST, ROLES.CLAIMS_EXAMINER].includes(currentUser?.role);
    const canAddNote = true; // Most roles can add notes

    const handleAddNote = () => {
        if (actionComment.trim()) {
            updateClaim(claim.id, {
                notes: [...(claim.notes || []), { id: `note-${Date.now()}`, user: currentUser?.id, timestamp: new Date().toISOString(), comment: actionComment }],
                auditLog: [...claim.auditLog, { id: `aud-${Date.now()}`, timestamp: new Date().toISOString(), user: currentUser?.id, action: 'Note Added', details: actionComment }]
            });
            setActionComment('');
        }
    };

    const handleDocUpload = (e) => {
        const files = Array.from(e.target.files);
        const newDocs = files.map(file => ({
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            status: 'Pending',
            uploadedBy: currentUser?.id,
            uploadedDate: new Date().toISOString().split('T')[0],
            category: 'Ad-hoc',
            deficiency: null,
            file: URL.createObjectURL(file) // For preview
        }));
        updateClaim(claim.id, {
            documents: [...(claim.documents || []), ...newDocs],
            auditLog: [...claim.auditLog, { id: `aud-${Date.now()}`, timestamp: new Date().toISOString(), user: currentUser?.id, action: 'Document Uploaded', details: `Uploaded ${newDocs.length} new document(s).` }]
        });
    };

    const handleDocStatusUpdate = (docId, status, deficiency = null) => {
        updateClaim(claim.id, {
            documents: claim.documents?.map(doc =>
                doc.id === docId ? { ...doc, status: status, deficiency: deficiency } : doc
            ),
            auditLog: [...claim.auditLog, { id: `aud-${Date.now()}`, timestamp: new Date().toISOString(), user: currentUser?.id, action: 'Document Verified', details: `Document ${docId} status updated to ${status}.` }]
        });
    };

    const handleDocumentPreview = (doc) => {
        setSelectedDocument(doc);
    };

    const DocPreviewModal = ({ doc, onClose }) => (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', height: '90%', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                    <h3>Document Preview: {doc?.name}</h3>
                    <button onClick={onClose} className="modal-close-button">✖</button>
                </div>
                <div style={{ flexGrow: 1, overflow: 'auto', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {doc?.name.toLowerCase().endsWith('.pdf') ? (
                        <p>PDF Preview (Not rendered in this demo)</p> // In a real app, embed a PDF viewer
                    ) : (
                        <img src={doc?.file || 'https://via.placeholder.com/600x400?text=Document+Preview'} alt="Document Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                </div>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <p style={{ margin: '0 0 var(--spacing-sm) 0' }}>Status: <StatusChip status={doc?.status} /></p>
                    <p style={{ margin: '0' }}>Uploaded by: {USER_DATA.find(u => u.id === doc?.uploadedBy)?.name || 'N/A'} on {doc?.uploadedDate}</p>
                    {doc?.deficiency && <p style={{ color: 'var(--color-red-600)' }}>Deficiency: {doc.deficiency}</p>}
                </div>
            </div>
        </div>
    );

    const ConfirmActionModal = ({ type, onClose, onSubmit, comment, setComment }) => {
        let title = '';
        let buttonText = '';
        if (type === 'approve') { title = 'Confirm Approval'; buttonText = 'Approve Claim'; }
        else if (type === 'reject') { title = 'Confirm Rejection'; buttonText = 'Reject Claim'; }
        else if (type === 'request_info') { title = 'Request Additional Information'; buttonText = 'Send Request'; }

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{title}</h3>
                        <button onClick={onClose} className="modal-close-button">✖</button>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Comments / Reason</label>
                        <textarea
                            className="form-textarea"
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={`Enter comments for ${type}...`}
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-md mt-lg">
                        <button className="button button-secondary" onClick={onClose}>Cancel</button>
                        <button className={`button ${type === 'reject' ? 'button-danger' : 'button-primary'}`} onClick={onSubmit}>
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <h2 style={{ margin: '0' }}>Claim: {claim.id}</h2>
                    <p style={{ margin: 'var(--spacing-xs) 0', color: 'var(--text-secondary)' }}>{claim.type} | Insured: {claim.insuredName}</p>
                </div>
                <div className="flex gap-md">
                    {canApprove && <button className="button button-primary" onClick={() => handleActionClick('approve')}>Approve</button>}
                    {canReject && <button className="button button-danger" onClick={() => handleActionClick('reject')}>Reject</button>}
                    {canRequestInfo && <button className="button button-secondary" onClick={() => handleActionClick('request_info')}>Request Info</button>}
                    {/* <button className="button button-secondary">Edit</button> */}
                </div>
            </div>

            <MilestoneTracker currentStatus={claim.status} />

            <div className="tabs-container">
                <button className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
                <button className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents</button>
                <button className={`tab-button ${activeTab === 'adjudication' ? 'active' : ''}`} onClick={() => setActiveTab('adjudication')}>Adjudication</button>
                <button className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>Approvals</button>
                <button className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes & History</button>
            </div>

            {activeTab === 'summary' && (
                <div className="grid grid-cols-2 gap-lg">
                    <Card>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-md)' }}>Claim Details</h3>
                        <p><strong>Status:</strong> <StatusChip status={claim.status} /></p>
                        <p><strong>Claim Type:</strong> {claim.type}</p>
                        <p><strong>Policy Number:</strong> {claim.policyNumber}</p>
                        <p><strong>Insured:</strong> {claim.insuredName}</p>
                        <p><strong>Claimant:</strong> {claim.claimantName}</p>
                        <p><strong>Event Date:</strong> {claim.eventDate}</p>
                        <p><strong>Submission Date:</strong> {claim.submissionDate}</p>
                        <p><strong>Payout Amount:</strong> ${claim.payoutAmount?.toLocaleString()}</p>
                        <p><strong>Assigned To:</strong> {assignedExaminer?.name || 'Unassigned'}</p>
                        <p><strong>Risk Score:</strong> {claim.riskScore}</p>
                        <p><strong>SLA Status:</strong> {claim.slaStatus}</p>
                    </Card>
                    <AuditFeed auditLog={claim.auditLog || []} />
                </div>
            )}

            {activeTab === 'documents' && (
                <Card>
                    <div className="flex justify-between items-center mb-md border-b pb-md">
                        <h3 style={{ margin: '0' }}>Documents ({uploadedDocs.length}/{requiredDocs.length})</h3>
                        {canEditDocuments && (
                            <label className="button button-secondary">
                                Upload New Document
                                <input type="file" multiple style={{ display: 'none' }} onChange={handleDocUpload} />
                            </label>
                        )}
                    </div>
                    {requiredDocs.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: 'var(--font-weight-medium)' }}>Mandatory Document Checklist for {claim.type}:</p>
                            <ul>
                                {requiredDocs.map(docName => {
                                    const isUploaded = uploadedDocs.some(d => d.name.includes(docName) && d.status === 'Accepted');
                                    return (
                                        <li key={docName} style={{ color: isUploaded ? 'var(--status-approved-text)' : 'var(--text-secondary)' }}>
                                            {isUploaded ? '✓' : '☐'} {docName} {isUploaded && '(Accepted)'}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {uploadedDocs.length > 0 ? (
                        <table className="data-grid">
                            <thead>
                                <tr>
                                    <th>Document Name</th>
                                    <th>Status</th>
                                    <th>Uploaded By</th>
                                    <th>Uploaded Date</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadedDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>{doc.name}</td>
                                        <td><StatusChip status={doc.status} /></td>
                                        <td>{USER_DATA.find(u => u.id === doc.uploadedBy)?.name || 'N/A'}</td>
                                        <td>{doc.uploadedDate}</td>
                                        <td>{doc.category}</td>
                                        <td className="flex gap-sm">
                                            <button className="button button-secondary" onClick={() => handleDocumentPreview(doc)}>Preview</button>
                                            {canEditDocuments && doc.status === 'Pending' && (
                                                <>
                                                    <button className="button button-primary" onClick={() => handleDocStatusUpdate(doc.id, 'Accepted')}>Accept</button>
                                                    <button className="button button-danger" onClick={() => handleDocStatusUpdate(doc.id, 'Rejected', 'Missing critical information')}>Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState icon="📄" title="No Documents Uploaded" message="No supporting documents have been uploaded for this claim yet." />
                    )}
                </Card>
            )}

            {activeTab === 'adjudication' && (
                <div className="grid grid-cols-2 gap-lg">
                    <Card>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-md)' }}>Eligibility & Validation</h3>
                        <p><strong>Policy Status:</strong> Active</p>
                        <p><strong>Coverage Period:</strong> Within bounds</p>
                        <p><strong>Contestability Period:</strong> Passed</p>
                        <p><strong>Fraud Indicators:</strong> None</p>
                        <p><strong>Beneficiary Match:</strong> Verified</p>
                        <button className="button button-primary mt-md" disabled={!canApprove}>Run Re-validation</button>
                    </Card>
                    <Card>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-md)' }}>Benefit Calculation</h3>
                        <p><strong>Gross Benefit:</strong> ${claim.payoutAmount?.toLocaleString()}</p>
                        <p><strong>Deductions:</strong> $0</p>
                        <p><strong>Loan Offsets:</strong> $0</p>
                        <p><strong>Tax Withholding:</strong> $0</p>
                        <p><strong>Net Payout:</strong> ${claim.payoutAmount?.toLocaleString()}</p>
                        <button className="button button-primary mt-md" disabled={!canApprove}>Recalculate Benefit</button>
                    </Card>
                    {/* Add more adjudication related sections here if needed */}
                </div>
            )}

            {activeTab === 'approvals' && (
                <Card>
                    <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-md)' }}>Approval History</h3>
                    {claim.approvalHistory && claim.approvalHistory.length > 0 ? (
                        <table className="data-grid">
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Approver</th>
                                    <th>Decision</th>
                                    <th>Timestamp</th>
                                    <th>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claim.approvalHistory.map((approval, index) => (
                                    <tr key={index}>
                                        <td>{approval.level}</td>
                                        <td>{approval.approver}</td>
                                        <td>{approval.decision === 'Approved' ? '🟢 Approved' : '🔴 Rejected'}</td>
                                        <td>{new Date(approval.timestamp).toLocaleString()}</td>
                                        <td>{approval.comment}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState icon="✅" title="No Approval History" message="This claim has not gone through any formal approval steps yet." />
                    )}
                    {claim.currentApprovers && claim.currentApprovers.length > 0 && (
                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Current Approvers:</h4>
                            <p>{claim.currentApprovers.map(id => USER_DATA.find(u => u.id === id)?.name).join(', ')}</p>
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'notes' && (
                <div className="grid grid-cols-2 gap-lg">
                    <Card>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-md)' }}>Internal Notes</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 'var(--spacing-md)' }}>
                            {claim.notes && claim.notes.length > 0 ? (
                                claim.notes.map(note => (
                                    <div key={note.id} style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                        <p style={{ margin: '0' }}><strong>{USER_DATA.find(u => u.id === note.user)?.name}:</strong> {note.comment}</p>
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{new Date(note.timestamp).toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No internal notes yet.</p>
                            )}
                        </div>
                        {canAddNote && (
                            <div className="form-group">
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    placeholder="Add a new note..."
                                    value={actionComment}
                                    onChange={(e) => setActionComment(e.target.value)}
                                ></textarea>
                                <button className="button button-secondary mt-md" onClick={handleAddNote}>Add Note</button>
                            </div>
                        )}
                    </Card>
                    <AuditFeed auditLog={claim.auditLog || []} />
                </div>
            )}

            {showModal && (
                <ConfirmActionModal
                    type={modalType}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleModalSubmit}
                    comment={actionComment}
                    setComment={setActionComment}
                />
            )}
            {selectedDocument && (
                <DocPreviewModal doc={selectedDocument} onClose={() => setSelectedDocument(null)} />
            )}
        </>
    );
};

const AdminSettingsScreen = ({ navigateTo }) => {
    const { currentUser } = useContext(AppContext);

    if (currentUser?.role !== ROLES.OPS_ADMIN) {
        return <EmptyState
            icon="🚫"
            title="Access Denied"
            message="You do not have the necessary permissions to view this page."
            actionButton={{ label: 'Back to Dashboard', onClick: () => navigateTo({ screen: 'DASHBOARD' }) }}
        />;
    }

    return (
        <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Admin Settings</h2>
            <div className="card-grid">
                <Card onClick={() => alert('User Management Placeholder')}>
                    <h3 style={{ margin: '0 0 var(--spacing-sm) 0' }}>User & Role Management</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage users, roles, and permissions.</p>
                </Card>
                <Card onClick={() => alert('Workflow Config Placeholder')}>
                    <h3 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Workflow Configuration</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Define claim statuses, transitions, and approval matrices.</p>
                </Card>
                <Card onClick={() => alert('Rules Engine Placeholder')}>
                    <h3 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Business Rules Engine</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure automated rules for validation and routing.</p>
                </Card>
                <Card onClick={() => alert('SLA Management Placeholder')}>
                    <h3 style={{ margin: '0 0 var(--spacing-sm) 0' }}>SLA Management</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Set up and monitor Service Level Agreements.</p>
                </Card>
            </div>
            <AuditFeed auditLog={CLAIMS_DATA_SEED.flatMap(c => c.auditLog)} /> {/* Global audit log */}
        </>
    );
};


// --- Main App Component ---

function App() {
    const [view, setView] = useState({ screen: 'LOGIN', params: {} });
    const [currentUser, setCurrentUser] = useState(null); // Initially null, set after login

    // Handler for updating a claim in CLAIMS_DATA_SEED
    const updateClaim = (id, updatedFields) => {
        CLAIMS_DATA_SEED = CLAIMS_DATA_SEED.map(claim =>
            claim.id === id ? { ...claim, ...updatedFields } : claim
        );
        // Force re-render of current view if it's the detail page
        setView(prevView => ({ ...prevView, params: { ...prevView.params } }));
    };

    const navigateTo = (newView) => {
        setView(newView);
    };

    const breadcrumbPath = () => {
        const path = [{ label: 'Dashboard', view: { screen: 'DASHBOARD' } }];
        if (view.screen === 'CLAIMS_LIST') {
            path.push({ label: 'Claims List', view: { screen: 'CLAIMS_LIST' } });
        } else if (view.screen === 'CLAIMS_REGISTRATION') {
            path.push({ label: 'Claims List', view: { screen: 'CLAIMS_LIST' } });
            path.push({ label: 'Register Claim', view: { screen: 'CLAIMS_REGISTRATION' } });
        } else if (view.screen === 'CLAIM_DETAIL' && view.params.claimId) {
            path.push({ label: 'Claims List', view: { screen: 'CLAIMS_LIST' } });
            path.push({ label: `Claim ${view.params.claimId}`, view: { screen: 'CLAIM_DETAIL', params: { claimId: view.params.claimId } } });
        } else if (view.screen === 'ADMIN_SETTINGS') {
            path.push({ label: 'Admin Settings', view: { screen: 'ADMIN_SETTINGS' } });
        }
        return path;
    };

    // Simulate login
    const handleLogin = (userId) => {
        const user = USER_DATA.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            navigateTo({ screen: 'DASHBOARD' });
        }
    };

    // Simple Login Screen
    if (view.screen === 'LOGIN') {
        return (
            <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Card style={{ padding: 'var(--spacing-xl)', textAlign: 'center', minWidth: '350px' }}>
                    <h2 style={{ margin: '0 0 var(--spacing-lg) 0' }}>Welcome to L&A Claims</h2>
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Select a Role to Login:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        {USER_DATA.filter(u => u.role !== ROLES.CLAIMANT).map(user => (
                            <button
                                key={user.id}
                                className="button button-secondary"
                                onClick={() => handleLogin(user.id)}
                                style={{ padding: 'var(--spacing-md)' }}
                            >
                                {user.role} ({user.name})
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ currentUser, navigateTo, updateClaim }}>
            <div className="app-container">
                <Header currentUser={currentUser} navigateTo={navigateTo} onSearch={(term) => navigateTo({ screen: 'CLAIMS_LIST', params: { searchTerm: term } })} />
                <main className="app-content">
                    <Breadcrumbs path={breadcrumbPath()} navigateTo={navigateTo} />
                    {view.screen === 'DASHBOARD' && <DashboardScreen currentUser={currentUser} navigateTo={navigateTo} />}
                    {view.screen === 'CLAIMS_LIST' && <ClaimsListScreen navigateTo={navigateTo} params={view.params} />}
                    {view.screen === 'CLAIMS_REGISTRATION' && <ClaimsRegistrationScreen navigateTo={navigateTo} currentUser={currentUser} />}
                    {view.screen === 'CLAIM_DETAIL' && <ClaimDetailScreen navigateTo={navigateTo} params={view.params} currentUser={currentUser} updateClaim={updateClaim} />}
                    {view.screen === 'ADMIN_SETTINGS' && <AdminSettingsScreen navigateTo={navigateTo} />}
                    {/* Placeholder for other screens */}
                    {/* {view.screen === 'NOTIFICATIONS' && <NotificationsScreen />} */}
                </main>
            </div>
        </AppContext.Provider>
    );
}

export default App;