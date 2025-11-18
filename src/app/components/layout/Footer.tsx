import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <span className="text-xl font-light text-stone-800">
              Nour <span className="font-semibold">Distribution</span>
            </span>
            <p className="text-stone-600 mt-4 max-w-sm">
              Distribution professionnelle de cheveux de tresse africaine pour vos besoins B2B et B2C.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-stone-900 mb-4">Navigation</h4>
            <ul className="space-y-2 text-stone-600 text-sm">
              <li><Link href="/" className="hover:text-stone-900 transition-colors">Accueil</Link></li>
              <li><Link href="/products" className="hover:text-stone-900 transition-colors">Produits</Link></li>
              <li><a href="#contact" className="hover:text-stone-900 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-stone-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-stone-600 text-sm">
              <li>Tunis, Tunisie</li>
              <li>contact@nourdistribution.com</li>
              <li>+216 XX XXX XXX</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-200 pt-8 text-center text-stone-500 text-sm">
          <p>&copy; 2024 Nour Distribution. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;