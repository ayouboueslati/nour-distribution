export interface B2CClient {
  id: string;
  type: 'b2c';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  statut: string;
  valeur: string;
  totalCommandes: number;
  totalDepense: string;
  dernierAchat: string;
  devisEnCours: number;
}

export interface B2BClient {
  id: string;
  type: 'b2b';
  entreprise: string;
  matricule: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  statut: string;
  valeur: string;
  typeBusiness: string;
  totalCommandes: number;
  totalDepense: string;
  dernierAchat: string;
  devisEnCours: number;
  conditionsPaiement: string;
}

export type Client = B2CClient | B2BClient;