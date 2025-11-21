'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { apiService } from '../../../../lib/api';
import { Card } from '../../../../components/ui/index';
import { ArrowLeft, Save, RefreshCw, Mail, User, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'staff',
    is_active: true
  });

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin && userId) {
      loadUser();
    }
  }, [userId, isAdmin]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers(1, 1000); // Get all users
      const foundUser = data.users.find((u: User) => u.id === userId);
      
      if (foundUser) {
        setUser(foundUser);
        setFormData({
          email: foundUser.email,
          full_name: foundUser.full_name,
          role: foundUser.role,
          is_active: foundUser.is_active
        });
      } else {
        setError('Utilisateur non trouvé');
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateUser(userId, formData);
      setSuccess('Utilisateur mis à jour avec succès!');
      setTimeout(() => {
        router.push('/admin/users');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) {
      return;
    }

    try {
      const result = await apiService.resetUserPassword(userId);
      alert(`Mot de passe réinitialisé avec succès!\nNouveau mot de passe: ${result.new_password}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Accès Refusé</h2>
          <p className="text-red-600">
            Vous n'avez pas les permissions nécessaires pour modifier les utilisateurs.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-stone-600 mt-4">Chargement de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Utilisateur non trouvé</h2>
          <Link
            href="/admin/users"
            className="text-amber-600 hover:text-amber-700 font-semibold"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/users"
          className="p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-light text-stone-800">Modifier l'utilisateur</h1>
          <p className="text-stone-600 mt-1">
            {user.email}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Informations de l'utilisateur</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Nom Complet *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                {currentUser?.role === 'super_admin' && (
                  <option value="admin">Administrateur</option>
                )}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-stone-700">
                  Compte actif
                </span>
              </label>
              <p className="text-xs text-stone-500 mt-1">
                Les comptes inactifs ne peuvent pas se connecter
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-stone-200">
              <Link
                href="/admin/users"
                className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-xl font-semibold text-center hover:bg-stone-50 transition-all duration-200"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>

        {/* Actions Card */}
        <Card className="p-6 h-fit">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Actions</h2>
          
          <div className="space-y-4">
            {/* Reset Password */}
            <button
              onClick={handleResetPassword}
              className="w-full flex items-center gap-3 p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all duration-200 text-left"
            >
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-semibold text-stone-800">Réinitialiser le mot de passe</div>
                <div className="text-sm text-stone-600">Générer un nouveau mot de passe</div>
              </div>
            </button>

            {/* User Stats */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-stone-400" />
                <span className="text-stone-600">Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              
              {user.last_login && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">
                    Dernière connexion: {new Date(user.last_login).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-stone-400" />
                <span className="text-stone-600 capitalize">Rôle: {user.role}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}