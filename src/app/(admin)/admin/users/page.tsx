'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../lib/api';
import { Card } from '../../../components/ui/index';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  UserX, 
  UserCheck,
  Shield,
  Mail,
  Calendar,
  Eye
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  created_by?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

// Role badges configuration
const roleConfig = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  admin: { label: 'Administrateur', color: 'bg-red-100 text-red-800 border-red-200' },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  staff: { label: 'Staff', color: 'bg-green-100 text-green-800 border-green-200' },
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pageSize = 10;

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data: UsersResponse = await apiService.getUsers(currentPage, pageSize, roleFilter);
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [currentPage, roleFilter, currentUser]);

  const handleDeactivate = async (userId: string) => {
    try {
      setActionLoading(userId);
      await apiService.deactivateUser(userId);
      await loadUsers(); // Reload the list
    } catch (err) {
      setError('Erreur lors de la désactivation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      setActionLoading(userId);
      await apiService.activateUser(userId);
      await loadUsers(); // Reload the list
    } catch (err) {
      setError('Erreur lors de l\'activation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?')) {
      return;
    }

    try {
      setActionLoading(userId);
      await apiService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current user has admin privileges
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Accès Refusé</h2>
          <p className="text-red-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Utilisateurs</h1>
          <p className="text-stone-600 mt-1">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvel Utilisateur
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-stone-800">{users.length}</div>
          <div className="text-sm text-stone-600">Utilisateurs Totaux</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.is_active).length}
          </div>
          <div className="text-sm text-stone-600">Actifs</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => !u.is_active).length}
          </div>
          <div className="text-sm text-stone-600">Inactifs</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
          </div>
          <div className="text-sm text-stone-600">Administrateurs</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-stone-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Tous les rôles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-stone-600 mt-2">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-4 font-semibold text-stone-800">Utilisateur</th>
                  <th className="text-left p-4 font-semibold text-stone-800">Rôle</th>
                  <th className="text-left p-4 font-semibold text-stone-800">Statut</th>
                  <th className="text-left p-4 font-semibold text-stone-800">Dernière Connexion</th>
                  <th className="text-left p-4 font-semibold text-stone-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">{user.full_name}</div>
                          <div className="text-sm text-stone-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        roleConfig[user.role as keyof typeof roleConfig]?.color || roleConfig.staff.color
                      }`}>
                        {roleConfig[user.role as keyof typeof roleConfig]?.label || user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-600">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Jamais'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        {user.is_active ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            disabled={actionLoading === user.id || user.id === currentUser?.id}
                            className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Désactiver"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-stone-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Activer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        {isSuperAdmin && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-stone-500">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-stone-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
          >
            Précédent
          </button>
          
          <span className="text-stone-600">
            Page {currentPage} sur {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-stone-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}