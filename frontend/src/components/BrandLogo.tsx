
type BrandLogoProps = {
  size?: number;
  className?: string;
};

export default function BrandLogo({
  size = 120,
  className = "",
}: BrandLogoProps) {
  return (
    <img
      src="/BOB-logo.png"
      alt="BOB — Beyond Ordinary Boundaries"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
