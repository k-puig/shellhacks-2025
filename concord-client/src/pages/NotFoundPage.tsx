import { Button } from "@/components/ui/button";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-concord-primary flex items-center justify-center">
      <div className="text-center text-concord-secondary">
        <h1 className="text-4xl font-bold mb-4 text-concord-primary">404</h1>
        <p className="text-xl mb-6">Page not found</p>
        <Button asChild>
          <a href="/channels/@me">Go Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
