'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Airline } from '@/types/global';

interface AirlineFormProps {
  airline?: Partial<Airline>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function AirlineForm({ airline, onSubmit, onCancel }: AirlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: airline?.name || '',
    code: airline?.code || '',
    logo: airline?.logo || '',
    country: airline?.country || '',
    description: airline?.description || '',
    website: airline?.website || '',
    fleetSize: airline?.fleetSize || '',
    isActive: airline?.isActive ?? true,
    isFeatured: airline?.isFeatured ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        fleetSize: Number(formData.fleetSize) || 0,
      };
      await onSubmit(payload);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        {airline?._id ? 'Edit' : 'Add'} Airline
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Airline Name *
            </label>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Airline Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., DL"
              maxLength={3}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Logo URL *
          </label>
          <input
            type="url"
            required
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., United States"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fleet Size
            </label>
            <input
              type="number"
              value={formData.fleetSize}
              onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., 850"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="https://www.airline.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            rows={3}
            placeholder="Brief description of the airline..."
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 mr-2"
            />
            <span className="text-white">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
              className="w-4 h-4 mr-2"
            />
            <span className="text-white">Featured</span>
          </label>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
          >
            {loading ? 'Saving...' : airline?._id ? 'Update' : 'Add'} Airline
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
