import { Panel, ProgressMeter, SectionLabel, Tag } from "@/components/shared/Tui";
import { getResumeData } from "@/lib/content";
import { profileData } from "@/lib/site";

export function HomeView() {
  const resume = getResumeData();

  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        <Panel accent>
          <SectionLabel className="mb-2">Current Role</SectionLabel>
          <p className="text-[0.78rem] text-text">{profileData.home.currentRole.title}</p>
          <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
            {profileData.home.currentRole.subtitle}
          </p>
        </Panel>
      </div>

      <div>
        <SectionLabel>Skill Ratings</SectionLabel>
        <div className="space-y-2">
          {resume.skillRatings.map((rating) => (
            <ProgressMeter key={rating.label} label={rating.label} value={rating.value} />
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <SectionLabel>Specialties</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {profileData.home.specialties.map((specialty, index) => (
            <Tag key={specialty} accent={index < 2}>
              {specialty}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
