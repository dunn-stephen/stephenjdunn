import { SpaceInvadersFrame } from "@/components/easter-eggs/SpaceInvadersFrame";

export const metadata = {
  title: "Space Invaders"
};

export default function SpaceInvadersStandalonePage() {
  return <SpaceInvadersFrame src="/easter-eggs/space-invaders/game.html" />;
}
