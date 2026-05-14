import { useState } from 'react';
import { getPatientReportData, getEncounterReportData, getAppointmentReportData, downloadCSV, downloadPDF } from '../services/reportService';
import { Download, FileBarChart2, FileDown, Filter, Loader2, Search } from 'lucide-react';

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
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
                <FileBarChart2 size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
                <p className="mt-1 text-gray-500">Generate patient, encounter, and appointment summaries</p>
              </div>
            </div>

            {data.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 font-semibold text-green-700 hover:bg-green-100">
                  <Download size={16} />
                  CSV
                </button>
                <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100">
                  <FileDown size={16} />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter size={16} />
            Report filters
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <select className="rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="patients">Patient List</option>
              <option value="encounters">Encounter Summary</option>
              <option value="appointments">Appointment Schedule</option>
            </select>
            <input type="date" className="rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="From Date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            <input type="date" className="rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="To Date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
        {reportType === 'patients' && (
          <input type="text" className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Village filter" value={village} onChange={e => setVillage(e.target.value)} />
        )}
        {reportType === 'encounters' && (
          <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" value={visitType} onChange={e => setVisitType(e.target.value)}>
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
          <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" value={appointmentStatus} onChange={e => setAppointmentStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        )}
            </div>
            <button onClick={generateReport} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Generate
            </button>
          </div>
        </div>

      {loading && <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 text-gray-500 shadow-sm">Loading data...</div>}
      {data.length > 0 && (
        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-2 shadow-sm">
          <div className="overflow-x-auto rounded-2xl">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map(key => <th key={key} className="border-b border-gray-100 p-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{key}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(row).map((val, i) => <td key={i} className="p-3 text-sm text-gray-700">{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 50 && <div className="p-4 text-sm text-gray-500">Showing first 50 of {data.length} records.</div>}
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Generate a report to preview results here.</p>
        </div>
      )}
      </div>
    </div>
  );
}
