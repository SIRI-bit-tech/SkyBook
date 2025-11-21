'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AirlineForm } from '@/components/admin/AirlineForm';
import { Airline } from '@/types/global';

export default function AirlinesManagementPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

  useEffect(() => {
    fetchAirlines();
  }, []);

  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/admin/airlines?limit=100');
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

  const handleSaveAirline = async (data: any) => {
    try {
      const method = editingAirline ? 'PATCH' : 'POST';
      const url = editingAirline
        ? `/api/admin/airlines/${editingAirline._id}`
        : '/api/admin/airlines';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchAirlines();
        setShowForm(false);
        setEditingAirline(null);
      }
    } catch (error) {
      console.error('Failed to save airline:', error);
    }
  };

  const handleDeleteAirline = async (id: string) => {
    if (confirm('Are you sure you want to delete this airline?')) {
      try {
        const response = await fetch(`/api/admin/airlines/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchAirlines();
        }
      } catch (error) {
        console.error('Failed to delete airline:', error);
      }
    }
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
              setEditingAirline(null);
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            + Add Airline
          </Button>
        </div>

        {showForm && (
          <AirlineForm
            airline={editingAirline || undefined}
            onSubmit={handleSaveAirline}
            onCancel={() => {
              setShowForm(false);
              setEditingAirline(null);
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airlines.map((airline) => (
            <Card key={airline._id} className="bg-slate-800 border-slate-700 p-6">
              {airline.logo && (
                <img
                  src={airline.logo || '/placeholder.svg'}
                  alt={airline.name}
                  className="w-full h-20 object-contain mb-4"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{airline.name}</h3>
                <p className="text-sky-400 text-sm mb-2">Code: {airline.code}</p>
                {airline.country && (
                  <p className="text-slate-400 text-sm mb-4">{airline.country}</p>
                )}
                <div className="flex gap-2 mb-4">
                  {airline.isFeatured && (
                    <span className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                      Featured
                    </span>
                  )}
                  {airline.isActive && (
                    <span className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingAirline(airline);
                      setShowForm(true);
                    }}
                    variant="outline"
                    className="flex-1 text-sky-400 border-sky-400 hover:bg-sky-400/10"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAirline(airline._id!)}
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
