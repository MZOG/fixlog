interface EmailTemplateProps {
  message: string;
}

export function FeedbackThanksToAdmin({ message }: EmailTemplateProps) {
  return (
    <div>
      <p>Nowa opinia od użytkownika!</p>
      <p>
        <strong>Opinia:</strong>
      </p>
      <p>{message}</p>
    </div>
  );
}
