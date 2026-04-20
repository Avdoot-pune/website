export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="section-kicker">{eyebrow}</p>
      <h2 className="section-title mt-4 text-white">{title}</h2>
      <p className="section-copy mt-5">{description}</p>
    </div>
  );
}
