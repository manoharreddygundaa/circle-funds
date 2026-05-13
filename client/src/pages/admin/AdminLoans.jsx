import { useState } from 'react';
import api from '../../services/api';
import useLoans from '../../hooks/useLoans';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { CardSkeleton } from '../../components/ui/Loader';
import { EmptyState } from '../../components/shared/EmptyState';
import { RiskScoreBar } from '../../components/shared/RiskScoreBar';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { CheckCircle, XCircle, Eye, CreditCard, Filter } from 'lucide-react';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'active', 'completed'];

export default function AdminLoans() {
  const [activeTab, setActiveTab]   = useState('pending');
  const [modal, setModal]           = useState(null); // { loan, action: 'approve'|'reject' }
  const [adminNote, setAdminNote]   = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const { loans, pagination, filters, loading, error, updateFilter, changePage, refetch } =
    useLoans({ status: 'pending' });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateFilter('status', tab);
  };

  const openModal = (loan, action) => {
    setModal({ loan, action });
    setAdminNote('');
    setActionError('');
  };

  const submitAction = async () => {
    if (!modal) return;
    if (modal.action === 'reject' && !adminNote.trim()) {
      setActionError('Please provide a reason for rejection.');
      return;
    }
    setProcessing(true);
    setActionError('');
    try {
      await api.patch(`/admin/loans/${modal.loan._id}/status`, {
        status: modal.action === 'approve' ? 'approved' : 'rejected',
        adminNote,
      });
      setModal(null);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Loans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and action loan applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition capitalize
              ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : loans.length === 0 ? (
        <EmptyState icon={CreditCard} title={`No ${activeTab} loans`} description="Nothing to review in this category." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {['Borrower', 'Amount', 'Duration', 'Risk', 'Category', 'Applied', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loans.map((loan) => (
                <tr key={loan._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {loan.borrower?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">{loan.borrower?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(loan.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {loan.duration} mo
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={loan.riskLevel}>{loan.riskLevel}</Badge>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{loan.category}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {formatDate(loan.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={loan.status}>{loan.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openModal(loan, 'view')}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {loan.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => openModal(loan, 'approve')}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => openModal(loan, 'reject')}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={filters.page <= 1} onClick={() => changePage(filters.page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="secondary" size="sm" disabled={filters.page >= pagination.pages} onClick={() => changePage(filters.page + 1)}>Next</Button>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={
          modal?.action === 'approve' ? 'Approve Loan Application'
          : modal?.action === 'reject' ? 'Reject Loan Application'
          : 'Loan Details'
        }
        size="lg"
      >
        {modal?.loan && (
          <div className="space-y-4">
            {/* Loan summary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Amount',   val: formatCurrency(modal.loan.amount) },
                { label: 'Duration', val: `${modal.loan.duration} months` },
                { label: 'Rate',     val: `${modal.loan.interestRate}% p.a.` },
                { label: 'EMI',      val: formatCurrency(modal.loan.emiAmount) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{val}</p>
                </div>
              ))}
            </div>

            {/* Borrower credit */}
            {modal.loan.borrower?.creditScore && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Borrower: {modal.loan.borrower.name}</p>
                <RiskScoreBar score={modal.loan.borrower.creditScore} />
              </div>
            )}

            {/* Reason */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Loan Purpose</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                {modal.loan.reason}
              </p>
            </div>

            {/* Note for approve/reject */}
            {(modal.action === 'approve' || modal.action === 'reject') && (
              <Textarea
                label={`Admin Note ${modal.action === 'reject' ? '(required)' : '(optional)'}`}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  modal.action === 'reject'
                    ? 'Explain the reason for rejection...'
                    : 'Any notes for the borrower...'
                }
                rows={3}
                error={actionError}
              />
            )}

            {modal.action !== 'view' && (
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setModal(null)}>Cancel</Button>
                <Button
                  variant={modal.action === 'approve' ? 'success' : 'danger'}
                  fullWidth
                  loading={processing}
                  onClick={submitAction}
                >
                  {modal.action === 'approve' ? (
                    <><CheckCircle className="w-4 h-4" /> Approve Loan</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Reject Loan</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
