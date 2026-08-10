type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  appearance?: "default" | "editorial";
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  appearance = "default",
}: SectionHeaderProps) {
  const isEditorial = appearance === "editorial";

  return (
    <div>
      {eyebrow && (
        <p
          className={
            isEditorial
              ? "text-xs font-medium uppercase text-[#9a8558]"
              : "text-sm tracking-[0.25em] text-[#9c7a4f]"
          }
        >
          {eyebrow}
        </p>
      )}

      <h1
        className={
          isEditorial
            ? `${eyebrow ? "mt-3 " : ""}font-display text-4xl font-normal sm:text-5xl`
            : eyebrow
              ? "mt-3 text-2xl font-semibold"
              : "text-2xl font-semibold"
        }
      >
        {title}
      </h1>

      {description && (
        <p
          className={
            isEditorial
              ? "mt-4 max-w-2xl text-sm leading-7 text-[#6f6864] sm:text-base"
              : "mt-2 max-w-xl text-sm leading-6 text-[#6f6258]"
          }
        >
          {description}
        </p>
      )}
    </div>
  );
}
