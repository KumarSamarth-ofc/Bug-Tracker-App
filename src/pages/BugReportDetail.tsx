import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { useBugReports } from '../context/BugReportContext';
import { BugReportProvider } from '../context/BugReportContext';
import { useAuth } from '../context/AuthContext';
import CommentsSection from '../components/bug-report/CommentsSection';
import StatusUpdateForm from '../components/bug-report/StatusUpdateForm';
import AssignUserForm from '../components/bug-report/AssignUserForm';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Clock, 
  User, 
  DollarSign,
  Mail,
  Calendar 
} from 'lucide-react';

const BugReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBugReportById, deleteBugReport } = useBugReports();
  const { user } = useAuth();
  
  const [bugReport, setBugReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      loadBugReport();
    }
  }, [id]);
  
  const loadBugReport = async () => {
    setLoading(true);
    const report = await getBugReportById(id!);
    
    if (report) {
      setBugReport(report);
    } else {
      setError('Bug report not found');
    }
    
    setLoading(false);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bug report? This action cannot be undone.')) {
      setLoading(true);
      const success = await deleteBugReport(id!);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Failed to delete bug report');
        setLoading(false);
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-danger">Open</span>;
      case 'in-progress':
        return <span className="badge badge-warning">In Progress</span>;
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'closed':
        return <span className="badge badge-primary">Closed</span>;
      default:
        return <span className="badge badge-primary">{status}</span>;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <span className="badge bg-blue-100 text-blue-800">Low</span>;
      case 'medium':
        return <span className="badge bg-yellow-100 text-yellow-800">Medium</span>;
      case 'high':
        return <span className="badge bg-orange-100 text-orange-800">High</span>;
      case 'critical':
        return <span className="badge bg-red-100 text-red-800">Critical</span>;
      default:
        return <span className="badge badge-primary">{severity}</span>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !bugReport) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" /> Back to Dashboard
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error || 'Bug report not found'}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Back to Dashboard
        </button>
        
        <div className="flex space-x-2">
          <Link
            to={`/edit-report/${id}`}
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{bugReport.title}</h1>
          {getStatusBadge(bugReport.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-gray-900 whitespace-pre-line">{bugReport.description}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Severity</div>
                    <div>{getSeverityBadge(bugReport.severity)}</div>
                  </div>
                </div>
                
                {bugReport.bountyAmount > 0 && (
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Bounty</div>
                      <div className="text-gray-900">${bugReport.bountyAmount}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Assigned To</div>
                    <div className="text-gray-900">
                      {bugReport.assignedUser ? bugReport.assignedUser.name : 'Unassigned'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Reporter</div>
                    <div className="text-gray-900">{bugReport.reporterEmail}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="text-gray-900">
                      {formatDistanceToNow(new Date(bugReport.createdTimeStamp), { addSuffix: true })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(bugReport.createdTimeStamp), 'PPpp')}
                    </div>
                  </div>
                </div>
                
                {bugReport.closedTimeStamp && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Closed</div>
                      <div className="text-gray-900">
                        {formatDistanceToNow(new Date(bugReport.closedTimeStamp), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(bugReport.closedTimeStamp), 'PPpp')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <AssignUserForm 
            bugReportId={id!} 
            currentAssignedUser={bugReport.assignedUser?._id || null}
            onUpdate={loadBugReport}
          />
        </div>
        
        <div>
          <StatusUpdateForm 
            bugReportId={id!}
            currentStatus={bugReport.status}
            currentAssignedUser={bugReport.assignedUser?._id || null}
            onUpdate={loadBugReport}
          />
        </div>
      </div>
      
      <CommentsSection bugReportId={id!} />
    </div>
  );
};

const BugReportDetailWithContext = () => (
  <BugReportProvider>
    <BugReportDetail />
  </BugReportProvider>
);

export default BugReportDetailWithContext;