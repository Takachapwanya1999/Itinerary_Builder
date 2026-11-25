import Image from "next/image";

export function BrandLogo({ className }: { className: string }) {
  return (
    <Image
      src="/rusetat-logo.png"
      alt="Rusetat Migration & Travel International"
      width={900}
      height={281}
      priority
      className={className}
    />
  );
}
