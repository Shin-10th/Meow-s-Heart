import { Camera, Users, Send } from 'lucide-react'

export default function About() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-extrabold text-cocoa">🌸 About Us – Meow's Heart 🌸</h1>

        <div className="mt-8 space-y-5 text-left leading-relaxed text-cocoa-light">
          <p>
            Meow's Heart was born in 2022 with a simple dream. Our owner has always been in love with skincare
            and color cosmetics. She believes that makeup and self-care are not just about looking pretty, but
            about feeling confident and happy in your own skin.
          </p>
          <p>
            At Meow's Heart, we truly believe there is no woman who is not beautiful. Every girl deserves to
            glow, to shine, and to love herself a little more each day. That's why we bring trendy, authentic,
            and affordable beauty products to help you take care of yourself with joy.
          </p>
          <p>
            "Meow's Heart" is more than just a name — it is the owner's heart. Every customer is like a
            precious and delicate heart to us, and we value you with the same care and love. 🎀💗
          </p>
          <p>
            Here, beauty is not only in the products, but also in the way we share smiles, confidence, and
            kindness together.
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <a href="#" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100">
            <Camera className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Telegram" className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100">
            <Send className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100">
            <Users className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
