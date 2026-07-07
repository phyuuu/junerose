type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div>
      {eyebrow && (
        <p className="text-sm tracking-[0.25em] text-[#9c7a4f]">
          {eyebrow}
        </p>
      )}

      <h1 className={eyebrow ? "mt-3 text-2xl font-semibold" : "text-2xl font-semibold"}>
        {title}
      </h1>

      {description && (
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6258]">
          {description}
        </p>
      )}
    </div>
  );
}