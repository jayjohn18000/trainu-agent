interface ClientsHeaderProps {
  title?: string;
  description?: string;
}

export function ClientsHeader({ 
  title = "Clients",
  description = "Manage your client roster and track their progress"
}: ClientsHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
      <p className="text-sm md:text-base text-muted-foreground">{description}</p>
    </header>
  );
}

