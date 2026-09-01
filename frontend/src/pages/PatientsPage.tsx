import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { PatientListItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { AddPatientModal } from '../components/AddPatientModal';
import { Search, Filter, ArrowUpDown, ChevronRight, Users, UserPlus, X, Edit } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [sortBy, setSortBy] = useState('risk_score');
  const [order, setOrder] = useState('desc');

  // Add / Edit Patient Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<PatientListItem | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, [search, department, riskLevel, sortBy, order]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.getPatients({
        search,
        department: department || undefined,
        risk_level: riskLevel || undefined,
        sort_by: sortBy,
        order,
        limit: 100,
      });
      setPatients(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedPatientForEdit(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: PatientListItem) => {
    setModalMode('edit');
    setSelectedPatientForEdit(p);
    setShowAddModal(true);
  };

  const departments = ['Cardiology', 'Orthopedics', 'General Medicine', 'Neurology', 'Dermatology', 'ENT'];

  return (
    <div className="space-y-6">
      {/* Header with Add Patient CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Registry</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Search, filter, edit records, inspect risk profiles, and register new patients in MySQL database.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or Patient ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Risk Level Filter */}
        <select
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
        >
          <option value="">All Risk Levels</option>
          <option value="HIGH">High Risk Only</option>
          <option value="MEDIUM">Medium Risk Only</option>
          <option value="LOW">Low Risk Only</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-');
            setSortBy(s);
            setOrder(o);
          }}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
        >
          <option value="risk_score-desc">Highest Risk First</option>
          <option value="risk_score-asc">Lowest Risk First</option>
          <option value="age-desc">Oldest Patients First</option>
          <option value="age-asc">Youngest Patients First</option>
        </select>
      </div>

      {/* Patient Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
          Loading patient registry...
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No Patients Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No patients match your search or filter parameters. Click "Add Patient" to create a new patient record.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Add New Patient Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient Code</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Missed Visits</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.patient_id_code}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{p.department}</td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={p.missed_appointments >= 3 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                        {p.missed_appointments}
                      </span> / {p.total_appointments}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">{p.distance_km} km</td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">{p.next_followup_date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit patient information"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => navigate(`/patients/${p.patient_id_code}`)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors font-bold text-xs inline-flex items-center"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        mode={modalMode}
        initialPatient={selectedPatientForEdit}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchPatients}
      />

      <HealthcareDisclaimer />
    </div>
  );
};
