import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ | Artify',
  description: 'Answers to common questions about Artify, commissions, and accounts.'
}

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">About</p>
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Short answers to help you get started. Still stuck? <Link className="underline" href="/contact">Contact us</Link>.</p>
      </header>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-artify">
          <AccordionTrigger>What is Artify?</AccordionTrigger>
          <AccordionContent>
            Artify is a marketplace for discovering original art and requesting custom commissions directly from artists. It focuses on a clean, lightweight experience.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-commissions-work">
          <AccordionTrigger>How do commissions work?</AccordionTrigger>
          <AccordionContent>
            Browse artists, submit a commission request with your brief and budget, and the selected artist can accept or decline. Once accepted, you can track progress in your dashboard.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="pricing">
          <AccordionTrigger>How is pricing decided?</AccordionTrigger>
          <AccordionContent>
            Artists set prices based on scope, complexity, and timeline. Include a target budget in your request to help artists assess the work.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="account">
          <AccordionTrigger>Do I need an account to browse?</AccordionTrigger>
          <AccordionContent>
            Browsing is open to everyone. You’ll need an account to favorite works, request commissions, or manage your profile.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="artist">
          <AccordionTrigger>Can I become an artist on Artify?</AccordionTrigger>
          <AccordionContent>
            Yes. Sign up and set your role to Artist in your profile. You can add artworks via URL and start accepting commissions.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

