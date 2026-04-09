import { StarWarsFrame } from "@/components/easter-eggs/StarWarsFrame";

export const metadata = {
  title: "Star Wars"
};

export default function StarWarsStandalonePage() {
  return <StarWarsFrame src="/easter-eggs/star-wars-raw/index.html" />;
}
