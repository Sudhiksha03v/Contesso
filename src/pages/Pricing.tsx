import { Check, X, DollarSign } from 'lucide-react'; // Keep DollarSign and use it
import { cn } from '../lib/utils';

/**
 * Pricing page for the Contesso Contest Tracker.
 * Displays a freemium model with free and premium tiers, highlighting benefits
 * like auto reminders and priority API access. Modern SaaS UI with a clean layout.
 */
export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Basic contest tracking',
        'Platform filtering',
        'Bookmark contests',
      ],
      missing: ['Auto reminders', 'Priority API access'],
    },
    {
      name: 'Premium',
      price: '$9.99/mo',
      features: [
        'All Free features',
        'Auto reminders (email/SMS)',
        'Priority API access',
        'Early access to new features',
      ],
      missing: [],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-400 bg-clip-text text-transparent flex items-center">
          <DollarSign className="h-8 w-8 mr-2" /> Pricing
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 shadow-lg transition-all duration-300',
                plan.name === 'Premium' && 'border-2 border-indigo-500'
              )}
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {plan.name}
              </h2>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                {plan.price}
              </p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> {feature}
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-gray-400 dark:text-gray-500 line-through"
                  >
                    <X className="h-5 w-5 text-red-500 mr-2" /> {feature}
                  </li>
                ))}
              </ul>
              <button
                className={cn(
                  'w-full py-3 rounded-xl text-white transition-all duration-300',
                  plan.name === 'Free'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                )}
                disabled={plan.name === 'Free'}
              >
                {plan.name === 'Free' ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}