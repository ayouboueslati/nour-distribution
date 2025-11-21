'use client';

import { Card } from '../../../components/ui/index';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-light text-stone-800">Paramètres</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Profil Utilisateur</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Préférences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-700">Notifications email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-stone-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}