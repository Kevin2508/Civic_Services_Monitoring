import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import CCTVViewer from './CCTVViewer';

const AdminDashboard = () => {
  const [recentIssues, setRecentIssues] = useState([]);
  const [approvedIssues, setApprovedIssues] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [entries, setEntries] = useState(5);
  const [filter, setFilter] = useState('ALL');
  const [reportBody, setReportBody] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    fetchIssues();
    fetchReportedIssues();
  }, []);

  const fetchIssues = async () => {
    const { data, error } = await supabase
      .from('issues')
      .select('*, screenshots(image_url)')
      .in('status', ['Pending', 'Reported'])
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      return;
    }
    setRecentIssues(data);
  };

  const fetchReportedIssues = async () => {
    const { data, error } = await supabase
      .from('reported_issues')
      .select('*, issues(screenshots(image_url))')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching reported issues:', error);
      return;
    }
    setApprovedIssues(data);
  };

  const handleReport = async (issue) => {
    setSelectedIssue(issue);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportBody || !selectedIssue) return;

    const departmentMap = {
      'Water Logging': 'Cleaning',
      'Illegal Hoarding': 'Cleaning',
      'Broken Road': 'Roads',
      'Cleaning Issue': 'Cleaning',
      'Overflowing Drainage': 'Cleaning',
    };
    const deptName = departmentMap[selectedIssue.issue_type] || 'Cleaning';
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id, contact')
      .eq('name', deptName)
      .single();

    if (deptError) {
      console.error('Error fetching department:', deptError);
      return;
    }

    await supabase
      .from('issues')
      .update({ status: 'Reported' })
      .eq('id', selectedIssue.id);

    const { data: reportedIssue, error: reportError } = await supabase
      .from('reported_issues')
      .insert({
        issue_id: selectedIssue.id,
        camera_id: selectedIssue.camera_id,
        issue_type: selectedIssue.issue_type,
        timestamp: selectedIssue.timestamp,
        dept_contact: deptData.contact,
        location: (await supabase.from('cameras').select('location').eq('camera_id', selectedIssue.camera_id).single()).data.location,
        status: 'Re-check',
        report_body: reportBody,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error reporting issue:', reportError);
      return;
    }

    await supabase
      .from('notifications')
      .insert({
        department_id: deptData.id,
        issue_id: reportedIssue.id,
        message: `New issue reported: ${selectedIssue.issue_type}`,
      });

    setShowReportModal(false);
    setReportBody('');
    fetchIssues();
    fetchReportedIssues();
  };

  const handleAction = async (issueId, action) => {
    if (action === 'Rejected') {
      await supabase
        .from('issues')
        .update({ status: 'Rejected' })
        .eq('id', issueId);
      fetchIssues();
    } else if (action === 'Closed') {
      await supabase
        .from('reported_issues')
        .update({ status: 'Resolved' })
        .eq('issue_id', issueId);
      fetchReportedIssues();
    }
  };

  const totalIssues = recentIssues.length + approvedIssues.length;
  const issuesSolved = approvedIssues.filter((i) => i.status === 'Resolved').length;
  const pendingIssues = recentIssues.length;

  return (
    <div className="admin-dashboard">
      <div className="stats">
        <div className="stat-card">
          <h3>Total Issues</h3>
          <p>{totalIssues}</p>
        </div>
        <div className="stat-card">
          <h3>Issues Solved</h3>
          <p>{issuesSolved}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Issues</h3>
          <p>{pendingIssues}</p>
        </div>
      </div>

      <div className="table-section">
        <h3>Recent Civic Alerts</h3>
        <div className="table-header">
          <p>Last Updated: 2025-03-10 13:00</p>
          <div className="table-controls">
            <label>
              Show{' '}
              <select value={entries} onChange={(e) => setEntries(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>{' '}
              entries
            </label>
            <label>
              Filter by:{' '}
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">ALL</option>
                <option value="Reported">Reported</option>
                <option value="Pending">Pending</option>
              </select>
            </label>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Camera ID</th>
              <th>Issue Type</th>
              <th>Timestamp</th>
              <th>Area</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentIssues.slice(0, entries).map((issue, index) => (
              <tr key={issue.id}>
                <td>{index + 1}</td>
                <td>{issue.camera_id}</td>
                <td>{issue.issue_type}</td>
                <td>{new Date(issue.timestamp).toLocaleString()}</td>
                <td>{issue.area}</td>
                <td>
                  <button className="view-details" onClick={() => setSelectedCamera(issue.camera_id)}>
                    View Details
                  </button>
                </td>
                <td>
                  <span className={`status ${issue.status.toLowerCase()}`}>
                    {issue.status}
                  </span>
                  {issue.status !== 'Reported' && (
                    <>
                      <button className="approve" onClick={() => handleReport(issue)}>
                        Report
                      </button>
                      <button className="reject" onClick={() => handleAction(issue.id, 'Rejected')}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-section">
        <h3>Reported Civic Issues</h3>
        <div className="table-header">
          <p>Last Updated: 2025-03-10 13:00</p>
          <div className="table-controls">
            <label>
              Show{' '}
              <select value={entries} onChange={(e) => setEntries(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>{' '}
              entries
            </label>
            <label>
              Filter by:{' '}
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">ALL</option>
                <option value="Resolved">Resolved</option>
                <option value="Re-check">Re-check</option>
              </select>
            </label>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Camera ID</th>
              <th>Issue Type</th>
              <th>Timestamp</th>
              <th>Dept Contact</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {approvedIssues.slice(0, entries).map((issue, index) => (
              <tr key={issue.id}>
                <td>{index + 1}</td>
                <td>{issue.camera_id}</td>
                <td>{issue.issue_type}</td>
                <td>{new Date(issue.timestamp).toLocaleString()}</td>
                <td>{issue.dept_contact}</td>
                <td>
                  <a href={issue.location} target="_blank" rel="noopener noreferrer">
                    View on Map
                  </a>
                </td>
                <td>
                  <span className={`status ${issue.status.toLowerCase()}`}>
                    {issue.status}
                  </span>
                </td>
                <td>
                  <button className="view-details" onClick={() => setSelectedCamera(issue.camera_id)}>
                    View
                  </button>
                  {issue.status === 'Re-check' && (
                    <button className="recheck" onClick={() => handleAction(issue.issue_id, 'Closed')}>
                      Re-check
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCamera && <CCTVViewer cameraId={selectedCamera} />}

      {showReportModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Report Issue</h2>
            <p>Issue Type: {selectedIssue?.issue_type}</p>
            <textarea
              value={reportBody}
              onChange={(e) => setReportBody(e.target.value)}
              placeholder="Enter report details..."
              rows="5"
              style={{ width: '100%' }}
            />
            <button onClick={submitReport}>Submit Report</button>
            <button onClick={() => setShowReportModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;