interface EmailTemplateProps {
  category: string;
  description: string;
  reporter: string;
  reporter_email: string;
}

export function FeedbackThanksToUser() {
  return (
    <div>
      <p>Dzień dobry,</p>
      <p>serdecznie dziękujemy za przesłanie opinii o aplikacji FixLog.</p>
      <p>
        Twoja wiadomość została przekazana do naszego zespołu i pomoże nam w
        dalszym rozwoju platformy.
      </p>

      <p className="mt-5">Z wyrazami wdzięczności,</p>
      <p>Zespół FixLog</p>
    </div>
  );
}
