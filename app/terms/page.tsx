export const metadata = {
  title: 'Terms of Service | Artify',
  description: 'The basic terms for using Artify.'
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Please read these terms carefully before using Artify.</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">By accessing or using Artify, you agree to these Terms and our Privacy Policy.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Accounts</h2>
        <p className="text-muted-foreground">You are responsible for your account credentials and for all activity under your account.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. User Content & IP</h2>
        <p className="text-muted-foreground">You retain ownership of content you submit. By posting, you grant Artify a limited license to host and display your content for the purpose of operating the service.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Commissions</h2>
        <p className="text-muted-foreground">Commission requests help connect customers and artists. Any agreements, timelines, or deliverables are between the customer and the artist. Respect intellectual property and only upload content you have rights to use.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Prohibited Use</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Illegal content or activity.</li>
          <li>Harassment, spam, or attempts to disrupt the service.</li>
          <li>Infringing on others’ rights.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
        <p className="text-muted-foreground">We may suspend or terminate accounts that violate these Terms or harm the service.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Disclaimers</h2>
        <p className="text-muted-foreground">Artify is provided “as is.” We do not guarantee uninterrupted service or error‑free content.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
        <p className="text-muted-foreground">To the extent permitted by law, Artify is not liable for indirect or incidental damages arising from your use of the service.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">9. Changes</h2>
        <p className="text-muted-foreground">We may update these Terms from time to time. Continued use of the service constitutes acceptance of the updated Terms.</p>
      </section>
    </div>
  )
}
