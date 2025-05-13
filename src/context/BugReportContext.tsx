import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface BugReport {
  _id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  bountyAmount: number;
  reporterEmail: string;
  assignedUser: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdTimeStamp: string;
  closedTimeStamp?: string;
}

interface Comment {
  _id: string;
  bugReport: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  text: string;
  createdAt: string;
}

interface BugReportContextType {
  bugReports: BugReport[];
  assignedBugReports: BugReport[];
  openAssignedReports: BugReport[];
  closedAssignedReports: BugReport[];
  loading: boolean;
  error: string | null;
  getBugReports: () => Promise<void>;
  getBugReportById: (id: string) => Promise<BugReport | null>;
  createBugReport: (bugReport: Partial<BugReport>) => Promise<BugReport | null>;
  updateBugReport: (id: string, bugReport: Partial<BugReport>) => Promise<BugReport | null>;
  deleteBugReport: (id: string) => Promise<boolean>;
  getCommentsByBugReportId: (bugReportId: string) => Promise<Comment[]>;
  addComment: (bugReportId: string, text: string) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

const BugReportContext = createContext<BugReportContextType | undefined>(undefined);

export const useBugReports = () => {
  const context = useContext(BugReportContext);
  if (context === undefined) {
    throw new Error('useBugReports must be used within a BugReportProvider');
  }
  return context;
};

interface BugReportProviderProps {
  children: ReactNode;
}

export const BugReportProvider = ({ children }: BugReportProviderProps) => {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [assignedBugReports, setAssignedBugReports] = useState<BugReport[]>([]);
  const [openAssignedReports, setOpenAssignedReports] = useState<BugReport[]>([]);
  const [closedAssignedReports, setClosedAssignedReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all bug reports
  const getBugReports = async () => {
    setLoading(true);
    try {
      const [
        allReportsRes,
        assignedReportsRes,
        openAssignedRes,
        closedAssignedRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/bug-reports'),
        axios.get('http://localhost:5000/api/bug-reports/assigned'),
        axios.get('http://localhost:5000/api/bug-reports/assigned/open'),
        axios.get('http://localhost:5000/api/bug-reports/assigned/closed')
      ]);
      
      setBugReports(allReportsRes.data);
      setAssignedBugReports(assignedReportsRes.data);
      setOpenAssignedReports(openAssignedRes.data);
      setClosedAssignedReports(closedAssignedRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch bug reports');
    }
    setLoading(false);
  };

  // Get bug report by ID
  const getBugReportById = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/bug-reports/${id}`);
      setError(null);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch bug report');
      setLoading(false);
      return null;
    }
  };

  // Create bug report
  const createBugReport = async (bugReport: Partial<BugReport>) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bug-reports', bugReport);
      setBugReports([res.data, ...bugReports]);
      setError(null);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Failed to create bug report');
      setLoading(false);
      return null;
    }
  };

  // Update bug report
  const updateBugReport = async (id: string, bugReport: Partial<BugReport>) => {
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/bug-reports/${id}`, bugReport);
      
      // Update bug reports in state
      setBugReports(
        bugReports.map(report => report._id === id ? res.data : report)
      );
      
      // Update assigned bug reports if necessary
      if (assignedBugReports.some(report => report._id === id)) {
        setAssignedBugReports(
          assignedBugReports.map(report => report._id === id ? res.data : report)
        );
      }
      
      // Update open/closed assigned reports based on status
      const isCompleted = ['resolved', 'closed'].includes(res.data.status);
      
      if (isCompleted) {
        setOpenAssignedReports(
          openAssignedReports.filter(report => report._id !== id)
        );
        if (!closedAssignedReports.some(report => report._id === id)) {
          setClosedAssignedReports([res.data, ...closedAssignedReports]);
        } else {
          setClosedAssignedReports(
            closedAssignedReports.map(report => report._id === id ? res.data : report)
          );
        }
      } else {
        setClosedAssignedReports(
          closedAssignedReports.filter(report => report._id !== id)
        );
        if (!openAssignedReports.some(report => report._id === id)) {
          setOpenAssignedReports([res.data, ...openAssignedReports]);
        } else {
          setOpenAssignedReports(
            openAssignedReports.map(report => report._id === id ? res.data : report)
          );
        }
      }
      
      setError(null);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update bug report');
      setLoading(false);
      return null;
    }
  };

  // Delete bug report
  const deleteBugReport = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/bug-reports/${id}`);
      
      // Remove from all states
      setBugReports(bugReports.filter(report => report._id !== id));
      setAssignedBugReports(assignedBugReports.filter(report => report._id !== id));
      setOpenAssignedReports(openAssignedReports.filter(report => report._id !== id));
      setClosedAssignedReports(closedAssignedReports.filter(report => report._id !== id));
      
      setError(null);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to delete bug report');
      setLoading(false);
      return false;
    }
  };

  // Get comments by bug report ID
  const getCommentsByBugReportId = async (bugReportId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/bug-report/${bugReportId}`);
      setError(null);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch comments');
      setLoading(false);
      return [];
    }
  };

  // Add comment
  const addComment = async (bugReportId: string, text: string) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/comments', {
        bugReport: bugReportId,
        text
      });
      
      setError(null);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Failed to add comment');
      setLoading(false);
      return null;
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
      
      setError(null);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to delete comment');
      setLoading(false);
      return false;
    }
  };

  return (
    <BugReportContext.Provider
      value={{
        bugReports,
        assignedBugReports,
        openAssignedReports,
        closedAssignedReports,
        loading,
        error,
        getBugReports,
        getBugReportById,
        createBugReport,
        updateBugReport,
        deleteBugReport,
        getCommentsByBugReportId,
        addComment,
        deleteComment
      }}
    >
      {children}
    </BugReportContext.Provider>
  );
};