import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { getAll } from './db';

// Helper: download CSV
export function downloadCSV(data, filename) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper: download PDF with autoTable
export function downloadPDF(columns, rows, title, filename) {
  const doc = new jsPDF('landscape');
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 40,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [43, 87, 151] }
  });
  doc.save(filename);
}

// ----- Report data fetchers (from IndexedDB) -----
export async function getPatientReportData(fromDate, toDate, village) {
  let patients = await getAll('patients');
  // filter by registration date (created_at) and village
  if (fromDate) {
    patients = patients.filter(p => new Date(p.created_at) >= new Date(fromDate));
  }
  if (toDate) {
    patients = patients.filter(p => new Date(p.created_at) <= new Date(toDate));
  }
  if (village) {
    patients = patients.filter(p => p.village?.toLowerCase().includes(village.toLowerCase()));
  }
  return patients.map(p => ({
    'Patient Number': p.patient_number,
    'Full Name': p.full_name,
    Sex: p.sex,
    Age: p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()}` : '',
    Village: p.village,
    Phone: p.phone_number,
    'Registration Date': new Date(p.created_at).toLocaleDateString()
  }));
}

export async function getEncounterReportData(fromDate, toDate, visitType) {
  let encounters = await getAll('encounters');
  if (fromDate) {
    encounters = encounters.filter(e => new Date(e.visit_date) >= new Date(fromDate));
  }
  if (toDate) {
    encounters = encounters.filter(e => new Date(e.visit_date) <= new Date(toDate));
  }
  if (visitType && visitType !== 'all') {
    encounters = encounters.filter(e => e.visit_type === visitType);
  }
  // enrich with patient names
  const patients = await getAll('patients');
  const patientMap = new Map(patients.map(p => [p.id, p.full_name]));
  return encounters.map(e => ({
    'Visit Date': new Date(e.visit_date).toLocaleDateString(),
    'Patient Name': patientMap.get(e.patient_id) || 'Unknown',
    'Visit Type': e.visit_type,
    'Chief Complaint': e.chief_complaint,
    Diagnosis: e.diagnosis,
    'Treatment Given': e.treatment_given
  }));
}

export async function getAppointmentReportData(fromDate, toDate, status) {
  let appointments = await getAll('appointments');
  if (fromDate) {
    appointments = appointments.filter(a => new Date(a.scheduled_for) >= new Date(fromDate));
  }
  if (toDate) {
    appointments = appointments.filter(a => new Date(a.scheduled_for) <= new Date(toDate));
  }
  if (status && status !== 'all') {
    appointments = appointments.filter(a => a.status === status);
  }
  const patients = await getAll('patients');
  const patientMap = new Map(patients.map(p => [p.id, p.full_name]));
  return appointments.map(a => ({
    'Date/Time': new Date(a.scheduled_for).toLocaleString(),
    'Patient Name': patientMap.get(a.patient_id) || 'Unknown',
    Status: a.status,
    Notes: a.notes || ''
  }));
}