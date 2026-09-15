import type { Metadata } from "next";

import { ProviderProfileForm } from "@/components/provider/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { RatingStars } from "@/components/shared/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { getProviderProfileByUserId } from "@/lib/providers";
import { requireRole } from "@/lib/session";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.provider.profileTitle };

export default async function ProviderProfilePage() {
  const user = await requireRole("PROVIDER");
  const profile = await getProviderProfileByUserId(user.id);

  return (
    <>
      <PageHeader
        title={t.provider.profileTitle}
        subtitle={t.provider.profileSubtitle}
      />

      {/* Rating is read-only because nothing in the app produces one yet. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 shadow-xs">
        {profile && profile.reviewCount > 0 ? (
          <RatingStars
            rating={profile.rating}
            reviewCount={profile.reviewCount}
          />
        ) : (
          <p className="text-sm font-semibold">{t.provider.noReviewsYet}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t.provider.ratingMockNote}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProviderProfileForm
            initial={{
              categories: profile?.categories.map((c) => c.category) ?? [],
              areas: profile?.areas.map((a) => a.area) ?? [],
              bio: profile?.bio ?? "",
              yearsExperience: profile?.yearsExperience ?? 0,
              hourlyRateMxn: profile?.hourlyRateMxn ?? null,
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
