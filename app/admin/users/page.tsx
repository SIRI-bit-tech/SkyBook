'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { SearchFilter } from '@/components/admin/SearchFilter';
import { User } from '@/types/global';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, roleFilter]);

  const columns = [
    {
      header: 'Name',
      accessor: (user: User) => (
        <div>
          <div className="text-white font-semibold">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-slate-400 text-sm">{user.email}</div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: (user: User) => (
        <span className="text-slate-300">{user.phone || 'N/A'}</span>
      ),
    },
    {
      header: 'Role',
      accessor: (user: User) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.role === 'admin'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-sky-500/20 text-sky-400'
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: (user: User) => (
        <span className="text-slate-300">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">User Management</h1>
            <p className="text-slate-300">View and manage user accounts</p>
          </div>
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name or email..."
          filterValue={roleFilter}
          onFilterChange={setRoleFilter}
          filterOptions={[
            { value: 'user', label: 'Users' },
            { value: 'admin', label: 'Admins' },
          ]}
          filterPlaceholder="All Roles"
        />

        <DataTable columns={columns} data={users} />

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
