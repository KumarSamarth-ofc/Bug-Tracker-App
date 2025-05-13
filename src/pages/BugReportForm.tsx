import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBugReports } from '../context/BugReportContext';
import { BugReportProvider } from '../context/BugReportContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const BugReportForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBugReportById, createBugReport, updateBugReport } = useBugReports();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    severity: 'medium',
    bountyAmount: 0,
    reporterEmail: '',
    assignedUser: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(!!id);
  
  const { 
    title, 
    description, 
    status, 
    severity, 
    bountyAmount, 
    reporterEmail 
  } = formData;
  
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, reporterEmail: user.email }));
    }
    
    if (id) {
      loadBugReport();
    }
  }, [id, user]);
  
  const loadBugReport = async () => {
    setLoading(true);
    const bugReport = await getBugReportById(id!);
    
    if (bugReport) {
      setFormData({
        title: bugReport.title,
        description: bugReport.description,
        status: bugReport.status,
        severity: bugReport.severity,
        bountyAmount: bugReport.bountyAmount,
        reporterEmail: bugReport.reporterEmail,
        assignedUser: bugReport.assignedUser?._id || ''
      });
    } else {
      setError('Bug report not found');
    }
    
    setLoading(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bountyAmount' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isEditMode) {
        await updateBugReport(id!, formData);
        navigate(`/bug-report/${id}`);
      } else {
        const newBugReport = await createBugReport(formData);
        if (newBugReport) {
          navigate(`/bug-report/${newBugReport._id}`);
        }
      }
    } catch (err) {
      setError('Failed to save bug report');
    }
    
    setLoading(false);
  };
  
  if (loading && isEditMode) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Bug Report' : 'Create Bug Report'}
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Brief summary of the bug"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              className="form-input"
              rows={5}
              required
              placeholder="Detailed description of the bug, steps to reproduce, etc."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                Severity *
              </label>
              <select
                id="severity"
                name="severity"
                value={severity}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="bountyAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Bounty Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="bountyAmount"
                  name="bountyAmount"
                  value={bountyAmount}
                  onChange={handleChange}
                  className="form-input pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="reporterEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Reporter Email *
              </label>
              <input
                type="email"
                id="reporterEmail"
                name="reporterEmail"
                value={reporterEmail}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Email of the person reporting the bug"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn mr-4 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? 'Saving...' : 'Save Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BugReportFormWithContext = () => (
  <BugReportProvider>
    <BugReportForm />
  </BugReportProvider>
);

export default BugReportFormWithContext;