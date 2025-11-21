'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../lib/api';
import { Card } from '../../../components/ui/index';
import { Save, User, Mail, Shield, Calendar, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface UserStats {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  failed_login_attempts: number;
  is_locked: boolean;
  password_changed_at: string;
}

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);

  const [profileData, setProfileData] = useState({
    email: '',
    full_name: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profile, statsData] = await Promise.all([
        apiService.getCurrentUserProfile(),
        apiService.getUserStats()
      ]);
      
      setStats(statsData);
      setProfileData({
        email: profile.email,
        full_name: profile.full_name
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateUserProfile(profileData);
      setSuccess('Profil mis à jour avec succès!');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      setSaving(false);
      return;
    }

    try {
      await apiService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setSuccess('Mot de passe changé avec succès!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-stone-600 mt-4">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-stone-800">Mon Profil</h1>
        <p className="text-stone-600 mt-1">
          Gérez vos informations personnelles et votre mot de passe
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            Informations Personnelles
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Nom Complet *
              </label>
              <input
                type="text"
                required
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </form>
        </Card>

        {/* User Stats */}
        <Card className="p-6 h-fit">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Statistiques</h2>
          
          <div className="space-y-4">
            {stats && (
              <>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-stone-400" />
                  <div>
                    <div className="font-semibold text-stone-800">{stats.full_name}</div>
                    <div className="text-sm text-stone-600">{stats.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600 capitalize">Rôle: {stats.role}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">
                    Membre depuis: {new Date(stats.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {stats.last_login && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">
                      Dernière connexion: {new Date(stats.last_login).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}

                <div className="border-t border-stone-200 pt-4">
                  <div className="text-sm text-stone-600">
                    <div>Échecs de connexion: {stats.failed_login_attempts}</div>
                    <div className={stats.is_locked ? 'text-red-600' : 'text-green-600'}>
                      Statut: {stats.is_locked ? 'Compte verrouillé' : 'Compte actif'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Password Change */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-stone-800 mb-4">
          Changer le Mot de Passe
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
          <div className="relative">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type={showPasswords.current ? 'text' : 'password'}
              required
              value={passwordData.current_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
              className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-9 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type={showPasswords.new ? 'text' : 'password'}
              required
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-9 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              required
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
              className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-9 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200 disabled:opacity-50"
          >
            {saving ? 'Changement en cours...' : 'Changer le mot de passe'}
          </button>
        </form>
      </Card>
    </div>
  );
}