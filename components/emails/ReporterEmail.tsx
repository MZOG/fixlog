interface EmailTemplateProps {
  category: string;
  description: string;
}

export function ReporterEmail({ category, description }: EmailTemplateProps) {
  return (
    <div>
      <p>Dziękujemy za zgłoszenie awarii/usterki.</p>
      <p>
        <strong>Kategoria:</strong> {category}
      </p>
      <p>
        <strong>Opis:</strong> {description}
      </p>
      <p>Otrzymasz powiadomienia o postępach w zgłoszeniu.</p>
    </div>
  );
}
