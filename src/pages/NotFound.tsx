import { ButtonLink, Container } from "../components/ui";
import { useTitle } from "../components/ToolPage";

export default function NotFound() {
  useTitle("Page not found");
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">We couldn't find that page</h1>
      <p className="mt-3 text-muted">It may have moved. Start from the home page or pick a tool.</p>
      <ButtonLink to="/" className="mt-8">Go to home</ButtonLink>
    </Container>
  );
}
