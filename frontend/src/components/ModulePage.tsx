type ModulePageProps = {
  title: string;
  description?: string;
};

export default function ModulePage({
  title,
  description = "This module will be implemented in its dedicated feature directory.",
}: ModulePageProps) {
  return (
    <section className="coming-soon">
      <div className="upload-icon">
        <span>BOB</span>
      </div>
      <div className="eyebrow">BOB INTELLIGENCE PLATFORM</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
