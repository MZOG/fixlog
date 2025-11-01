import FeedbackForm from "@/components/FeedbackClient";

export default function FeedbackPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-5">Podziel się opinią</h1>
      <p>
        Aplikacja jest w fazie testowania, zbieramy dane, aby ulepszyć jej
        działanie.
      </p>
      <p>Twoja opina / sugestia będzie dla nas bardzo pomocna.</p>

      <FeedbackForm />
    </div>
  );
}
