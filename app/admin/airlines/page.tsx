'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Airline {
  _id: string;
  name: string;
  code: string;
  logo?: string;
  featured?: boolean;
  active: boolean;
}

export default function AirlinesManagementPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logo: '',
    featured: false,
  });

  useEffect(() => {
    fetchAirlines();
  }, []);

  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/airlines');
      if (response.ok) {
        const data = await response.json();
        setAirlines(data.airlines || []);
      }
    } catch (error) {
      console.error('Failed to fetch airlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAirline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/airlines/${editingId}` : '/api/airlines';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchAirlines();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', code: '', logo: '', featured: false });
      }
    } catch (error) {
      console.error('Failed to save airline:', error);
    }
  };

  const handleDeleteAirline = async (id: string) => {
    if (confirm('Are you sure you want to delete this airline?')) {
      try {
        const response = await fetch(`/api/airlines/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchAirlines();
        }
      } catch (error) {
        console.error('Failed to delete airline:', error);
      }
    }
  };

  const handleEditAirline = (airline: Airline) => {
    setFormData({
      name: airline.name,
      code: airline.code,
      logo: airline.logo || '',
      featured: airline.featured || false,
    });
    setEditingId(airline._id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Manage Airlines</h1>
            <p className="text-slate-300">Add, edit, or delete airlines and manage logos</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', code: '', logo: '', featured: false });
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            + Add Airline
          </Button>
        </div>

        {showForm && (
          <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit' : 'Add'} Airline</h2>
            <form onSubmit={handleSaveAirline} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Airline Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="e.g., Delta Air Lines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Airline Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="e.g., DL"
                    maxLength="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-white">Featured Airline</span>
              </label>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                >
                  {editingId ? 'Update' : 'Add'} Airline
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airlines.map((airline) => (
            <Card key={airline._id} className="bg-slate-800 border-slate-700 p-6">
              {airline.logo && (
                <img src={airline.logo || "/placeholder.svg"} alt={airline.name} className="w-full h-20 object-contain mb-4" />
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{airline.name}</h3>
                <p className="text-sky-400 text-sm mb-4">Code: {airline.code}</p>
                {airline.featured && (
                  <span className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm mb-4">
                    Featured
                  </span>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditAirline(airline)}
                    variant="outline"
                    className="flex-1 text-sky-400 border-sky-400 hover:bg-sky-400/10"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAirline(airline._id)}
                    variant="outline"
                    className="flex-1 text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="text-white border-slate-500 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
