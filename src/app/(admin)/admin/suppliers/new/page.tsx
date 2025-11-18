// frontend/src/app/(admin)/admin/suppliers/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Badge, Textarea, Select } from '../../../../components/ui';

export default function NewSupplierPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    type: '',
    specialite: '',
    siteWeb: '',
    contactPerson: '',
    notes: '',
    conditionsPaiement: '30 jours',
    delaiLivraison: '15'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est obligatoire';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic here (API call)
    console.log('Creating supplier:', formData);
    
    // Redirect to suppliers list
    router.push('/admin/suppliers');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Nouveau Fournisseur</h1>
          <p className="text-stone-600 mt-1">Ajoutez un nouveau partenaire à votre réseau</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          ← Retour
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations de Base</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Nom du fournisseur *"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    placeholder="Ex: Beauty Hair China"
                    error={errors.nom}
                    required
                  />

                  <Input
                    label="Téléphone *"
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    placeholder="Ex: +33 1 23 45 67 89"
                    error={errors.telephone}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="exemple@fournisseur.com"
                  />

                  <Input
                    label="Personne à contacter"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    placeholder="Nom du contact principal"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Adresse</h2>
                <Textarea
                  label="Adresse complète"
                  value={formData.adresse}
                  onChange={(e: { target: { value: string; }; }) => handleChange('adresse', e.target.value)}
                  placeholder="Adresse, Ville, Code postal, Pays"
                  rows={3}
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Business Details */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations Commerciales</h2>
                
                <div className="space-y-4">
                  <Select
                    label="Type de fournisseur *"
                    options={[
                      { value: '', label: 'Sélectionner un type' },
                      { value: 'Fabricant', label: 'Fabricant' },
                      { value: 'Distributeur', label: 'Distributeur' },
                      { value: 'Importateur', label: 'Importateur' },
                      { value: 'Grossiste', label: 'Grossiste' }
                    ]}
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    required
                  />

                  <Select
                    label="Spécialité principale"
                    options={[
                      { value: '', label: 'Sélectionner une spécialité' },
                      { value: 'Cheveux Brésilien', label: 'Cheveux Brésilien' },
                      { value: 'Mèches Malaisie', label: 'Mèches Malaisie' },
                      { value: 'Perruques Lace Front', label: 'Perruques Lace Front' },
                      { value: 'Cheveux Naturels Africains', label: 'Cheveux Naturels Africains' },
                      { value: 'Accessoires', label: 'Accessoires de coiffure' },
                      { value: 'Produits Entretien', label: 'Produits d\'entretien' }
                    ]}
                    value={formData.specialite}
                    onChange={(e) => handleChange('specialite', e.target.value)}
                  />

                  <Input
                    label="Site web"
                    value={formData.siteWeb}
                    onChange={(e) => handleChange('siteWeb', e.target.value)}
                    placeholder="https://..."
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Conditions de paiement"
                      options={[
                        { value: 'Comptant', label: 'Comptant' },
                        { value: '30 jours', label: '30 jours' },
                        { value: '45 jours', label: '45 jours' },
                        { value: '60 jours', label: '60 jours' }
                      ]}
                      value={formData.conditionsPaiement}
                      onChange={(e) => handleChange('conditionsPaiement', e.target.value)}
                    />

                    <Input
                      label="Délai livraison (jours)"
                      type="number"
                      value={formData.delaiLivraison}
                      onChange={(e) => handleChange('delaiLivraison', e.target.value)}
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Notes Internes</h2>
                <Textarea
                  label="Informations supplémentaires"
                  value={formData.notes}
                  onChange={(e: { target: { value: string; }; }) => handleChange('notes', e.target.value)}
                  placeholder="Notes sur la relation, qualité des produits, etc."
                  rows={4}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary"
          >
            Créer le Fournisseur
          </Button>
        </div>
      </form>
    </div>
  );
}