import { useState } from 'react';
import { getPatientReportData, getEncounterReportData, getAppointmentReportData, downloadCSV, downloadPDF } from '../services/reportService';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('patients');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [village, setVillage] = useState('');
  const [visitType, setVisitType] = useState('all');
  const [appointmentStatus, setAppointmentStatus] = useState('all');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    let reportData = [];
    if (reportType === 'patients') {
      reportData = await getPatientReportData(fromDate, toDate, village);
    } else if (reportType === 'encounters') {
      reportData = await getEncounterReportData(fromDate, toDate, visitType);
    } else if (reportType === 'appointments') {
      reportData = await getAppointmentReportData(fromDate, toDate, appointmentStatus);
    }
    setData(reportData);
    setLoading(false);
  };

  const exportCSV = () => {
    if (!data.length) return;
    const filename = `${reportType}_report_${new Date().toISOString().slice(0,19)}.csv`;
    downloadCSV(data, filename);
  };

  const exportPDF = () => {
    if (!data.length) return;
    const columns = Object.keys(data[0]);
    const rows = data.map(row => Object.values(row));
    const title = `${reportType.toUpperCase()} Report`;
    const filename = `${reportType}_report_${new Date().toISOString().slice(0,19)}.pdf`;
    downloadPDF(columns, rows, title, filename);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="bg-gray-100 p-4 rounded space-y-3">
        <select className="border p-2 w-full" value={reportType} onChange={e => setReportType(e.target.value)}>
          <option value="patients">Patient List</option>
          <option value="encounters">Encounter Summary</option>
          <option value="appointments">Appointment Schedule</option>
        </select>
        <div className="flex space-x-2">
          <input type="date" className="border p-2 w-1/2" placeholder="From Date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <input type="date" className="border p-2 w-1/2" placeholder="To Date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        {reportType === 'patients' && (
          <input type="text" className="border p-2 w-full" placeholder="Village (filter)" value={village} onChange={e => setVillage(e.target.value)} />
        )}
        {reportType === 'encounters' && (
          <select className="border p-2 w-full" value={visitType} onChange={e => setVisitType(e.target.value)}>
            <option value="all">All Visit Types</option>
            <option value="outpatient">Outpatient</option>
            <option value="inpatient">Inpatient</option>
            <option value="antenatal">Antenatal</option>
            <option value="immunization">Immunization</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency">Emergency</option>
          </select>
        )}
        {reportType === 'appointments' && (
          <select className="border p-2 w-full" value={appointmentStatus} onChange={e => setAppointmentStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        )}
        <button onClick={generateReport} className="bg-blue-600 text-white px-4 py-2 rounded">Generate</button>
      </div>
      {loading && <div className="mt-4">Loading data...</div>}
      {data.length > 0 && (
        <div className="mt-6">
          <div className="flex space-x-2 mb-2">
            <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded">Export CSV</button>
            <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">Export PDF</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-200">
                <tr>
                  {Object.keys(data[0]).map(key => <th key={key} className="border p-2 text-left">{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => <td key={i} className="border p-2">{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 50 && <div className="mt-2 text-sm">Showing first 50 of {data.length} records.</div>}
          </div>
        </div>
      )}
    </div>
  );
}