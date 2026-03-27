import { Hero } from "@/shared/services/heroService";
import React from "react";

type HeroIconProps = {
  hero: Hero;
};

const HeroIcon = (props: HeroIconProps) => {
  const { hero } = props;

  return (
    <div className="relative w-12 h-11 arcade-border-shadowless border-b-8 cursor-pointer z-10 group">
      <img
        src={`/resources/${hero?.spriteKey}/hud/icon.png`}
        className="w-full h-full"
      />
      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-50 transition-opacity mix-blend-mode-multiply mix-blend-multiply" />
    </div>
  );
};

export default HeroIcon;
