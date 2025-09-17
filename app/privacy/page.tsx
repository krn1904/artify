export const metadata = {
  title: 'Privacy Policy | Artify',
  description: 'How Artify collects, uses, and protects your information.'
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">We respect your privacy and only collect what we need to provide the service.</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Account details: name, email, password (hashed).</li>
          <li>Profile information: role, avatar URL, bio.</li>
          <li>Content you create: artworks, tags, commission requests.</li>
          <li>Technical data: basic logs for reliability and security.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Operate and improve the marketplace experience.</li>
          <li>Authenticate users and protect accounts.</li>
          <li>Provide support and respond to inquiries.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
        <p className="text-muted-foreground">We retain account and content data for as long as your account remains active or as needed to provide the service. You may request deletion of your account and associated content.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <p className="text-muted-foreground">We use essential cookies for authentication and session management. You can control cookies through your browser settings.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Access, correct, or delete your personal data.</li>
          <li>Export your data upon request.</li>
          <li>Contact us with privacy questions at <a className="underline" href="mailto:hello@artify.app">hello@artify.app</a>.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Changes</h2>
        <p className="text-muted-foreground">We may update this policy as the product evolves. Significant changes will be reflected here with an updated effective date.</p>
      </section>
    </div>
  )
}
