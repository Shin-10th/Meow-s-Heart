import { Link } from 'react-router-dom'
import { PawPrint, Sparkles, Gift, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const tiers = [
  { paws: 0, name: 'Kitten', perk: 'Welcome bonus of 3 paws on sign-up' },
  { paws: 10, name: 'Cat', perk: '5% off every order + early sale access' },
  { paws: 30, name: 'Lioness', perk: '10% off, birthday gift, free shipping' },
]

export default function Loyalty() {
  const { user, profile } = useAuth()

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <PawPrint className="mx-auto h-10 w-10 text-brand-500" />
        <h1 className="mt-3 font-display text-4xl font-extrabold text-cocoa">Meow's Paws Loyalty Program</h1>
        <p className="mt-3 text-cocoa-light">
          Join our loyalty program and earn rewards with every purr-chase!
        </p>
      </div>

      {user && profile ? (
        <div className="card mx-auto mt-10 max-w-md p-8 text-center">
          <p className="text-sm font-semibold text-cocoa-light">Your balance</p>
          <p className="mt-1 font-display text-5xl font-extrabold text-brand-500">{profile.loyalty_points}</p>
          <p className="text-sm text-cocoa-light">Meow's Paws</p>
        </div>
      ) : (
        <div className="mt-10 text-center">
          <Link to="/register" className="btn-primary inline-flex">Join Now &amp; Get 3 Bonus Paws</Link>
        </div>
      )}

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <PawPrint className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 font-display font-bold text-cocoa">Earn Meow's Paws</h3>
          <p className="mt-1 text-sm text-cocoa-light">Get 1 paw for every 30,000 MMK spent</p>
        </div>
        <div className="card p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 font-display font-bold text-cocoa">Exclusive Perks</h3>
          <p className="mt-1 text-sm text-cocoa-light">Early sale access &amp; birthday gifts</p>
        </div>
        <div className="card p-6 text-center">
          <Gift className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 font-display font-bold text-cocoa">Redeem Rewards</h3>
          <p className="mt-1 text-sm text-cocoa-light">Use paws for discounts &amp; free products</p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-display text-2xl font-bold text-cocoa">Loyalty Tiers</h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-4">
          {tiers.map((tier) => (
            <div key={tier.name} className="card flex items-center gap-4 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display font-bold text-cocoa">{tier.name} · {tier.paws}+ paws</p>
                <p className="text-sm text-cocoa-light">{tier.perk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
