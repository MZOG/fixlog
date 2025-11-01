interface EmailTemplateProps {
  category: string;
  description: string;
  reporter: string;
  reporter_email: string;
}

export function AdminEmail({
  category,
  description,
  reporter,
  reporter_email,
}: EmailTemplateProps) {
  return (
    <div>
      <p>W systemie pojawiło się nowe zgłoszenie:</p>
      <p>
        <strong>Reporter:</strong> {reporter} ({reporter_email})
      </p>
      <p>
        <strong>Kategoria:</strong> {category}
      </p>
      <p>
        <strong>Opis:</strong> {description}
      </p>
      <p>Proszę podjąć działania w celu rozwiązania problemu.</p>
    </div>
  );
}
