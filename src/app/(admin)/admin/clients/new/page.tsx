// frontend/src/app/(admin)/admin/clients/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Select, Textarea} from '../../../../components/ui';

export default function NewClientPage() {
  const router = useRouter();
  const [clientType, setClientType] = useState<'b2c' | 'b2b'>('b2c');
  
  // B2C Form State
  const [b2cData, setB2cData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    remarques: '',
    contactPreference: 'email'
  });

  // B2B Form State
  const [b2bData, setB2bData] = useState({
    entreprise: '',
    matricule: '',
    contact: '',
    email: '',
    telephone: '',
    adresse: '',
    modePaiement: 'virement',
    commentaire: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleB2cSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!b2cData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!b2cData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire';
    if (!b2cData.telephone.trim()) newErrors.telephone = 'Le téléphone est obligatoire';
    if (!b2cData.adresse.trim()) newErrors.adresse = 'L\'adresse est obligatoire';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Creating B2C client:', b2cData);
    router.push('/admin/clients');
  };

  const handleB2bSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!b2bData.entreprise.trim()) newErrors.entreprise = 'La raison sociale est obligatoire';
    if (!b2bData.matricule.trim()) newErrors.matricule = 'Le matricule fiscal est obligatoire';
    if (!b2bData.telephone.trim()) newErrors.telephone = 'Le téléphone est obligatoire';
    if (!b2bData.adresse.trim()) newErrors.adresse = 'L\'adresse est obligatoire';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Creating B2B client:', b2bData);
    router.push('/admin/clients');
  };

  const updateB2cField = (field: string, value: string) => {
    setB2cData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateB2bField = (field: string, value: string) => {
    setB2bData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Nouveau Client</h1>
          <p className="text-stone-600 mt-1">Ajoutez un nouveau client à votre base</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          ← Retour
        </Button>
      </div>

      {/* Client Type Selection */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Type de Client</h2>
          <div className="flex space-x-4">
            <ClientTypeButton
              active={clientType === 'b2c'}
              onClick={() => setClientType('b2c')}
              icon="👤"
              title="Particulier (B2C)"
              description="Client individuel"
            />
            <ClientTypeButton
              active={clientType === 'b2b'}
              onClick={() => setClientType('b2b')}
              icon="🏢"
              title="Professionnel (B2B)"
              description="Entreprise ou salon"
            />
          </div>
        </div>
      </Card>

      {/* B2C Client Form */}
      {clientType === 'b2c' && (
        <form onSubmit={handleB2cSubmit}>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                Informations Client Particulier
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <Input
                    label="Nom *"
                    value={b2cData.nom}
                    onChange={(e) => updateB2cField('nom', e.target.value)}
                    placeholder="Ex: Dupont"
                    error={errors.nom}
                    required
                  />

                  <Input
                    label="Prénom *"
                    value={b2cData.prenom}
                    onChange={(e) => updateB2cField('prenom', e.target.value)}
                    placeholder="Ex: Marie"
                    error={errors.prenom}
                    required
                  />

                  <Input
                    label="Téléphone *"
                    value={b2cData.telephone}
                    onChange={(e) => updateB2cField('telephone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    error={errors.telephone}
                    required
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={b2cData.email}
                    onChange={(e) => updateB2cField('email', e.target.value)}
                    placeholder="exemple@email.com"
                  />

                  <Textarea
                    label="Adresse de livraison *"
                    value={b2cData.adresse}
                    onChange={(e) => updateB2cField('adresse', e.target.value)}
                    placeholder="Rue, Ville, Code postal, Pays"
                    error={errors.adresse}
                    required
                    rows={3}
                  />

                  <Select
                    label="Méthode de contact préférée"
                    options={[
                      { value: 'email', label: 'Email' },
                      { value: 'telephone', label: 'Téléphone' },
                      { value: 'whatsapp', label: 'WhatsApp' }
                    ]}
                    value={b2cData.contactPreference}
                    onChange={(e) => updateB2cField('contactPreference', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Textarea
                  label="Remarques / Instructions de livraison"
                  value={b2cData.remarques}
                  onChange={(e) => updateB2cField('remarques', e.target.value)}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Créer le Client
            </Button>
          </div>
        </form>
      )}

      {/* B2B Client Form */}
      {clientType === 'b2b' && (
        <form onSubmit={handleB2bSubmit}>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                Informations Client Professionnel
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <Input
                    label="Raison sociale *"
                    value={b2bData.entreprise}
                    onChange={(e) => updateB2bField('entreprise', e.target.value)}
                    placeholder="Ex: Sarah Beauty Salon"
                    error={errors.entreprise}
                    required
                  />

                  <Input
                    label="Matricule fiscal *"
                    value={b2bData.matricule}
                    onChange={(e) => updateB2bField('matricule', e.target.value)}
                    placeholder="Ex: FR123456789"
                    error={errors.matricule}
                    required
                  />

                  <Input
                    label="Contact principal"
                    value={b2bData.contact}
                    onChange={(e) => updateB2bField('contact', e.target.value)}
                    placeholder="Nom du contact"
                  />

                  <Input
                    label="Téléphone / WhatsApp *"
                    value={b2bData.telephone}
                    onChange={(e) => updateB2bField('telephone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    error={errors.telephone}
                    required
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <Input
                    label="Email professionnel"
                    type="email"
                    value={b2bData.email}
                    onChange={(e) => updateB2bField('email', e.target.value)}
                    placeholder="contact@entreprise.com"
                  />

                  <Textarea
                    label="Adresse du siège social *"
                    value={b2bData.adresse}
                    onChange={(e) => updateB2bField('adresse', e.target.value)}
                    placeholder="Adresse complète de l'entreprise"
                    error={errors.adresse}
                    required
                    rows={3}
                  />

                  <Select
                    label="Mode de paiement souhaité *"
                    options={[
                      { value: 'virement', label: 'Virement bancaire' },
                      { value: 'cheque', label: 'Chèque' },
                      { value: 'especes', label: 'Espèces' },
                      { value: 'autre', label: 'À définir' }
                    ]}
                    value={b2bData.modePaiement}
                    onChange={(e) => updateB2bField('modePaiement', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Textarea
                  label="Commentaire / Demande spécifique"
                  value={b2bData.commentaire}
                  onChange={(e) => updateB2bField('commentaire', e.target.value)}
                  placeholder="Informations commerciales supplémentaires..."
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Créer le Client
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ClientTypeButton({ 
  active, 
  onClick, 
  icon, 
  title, 
  description 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-4 border-2 rounded-xl text-left transition-all duration-200 ${
        active 
          ? 'border-amber-500 bg-amber-50 shadow-md' 
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className={`font-semibold ${
            active ? 'text-amber-700' : 'text-stone-800'
          }`}>
            {title}
          </p>
          <p className={`text-sm ${
            active ? 'text-amber-600' : 'text-stone-600'
          }`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}