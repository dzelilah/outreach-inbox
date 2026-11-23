import { ExternalLink } from "lucide-react";
import { QualityIssueBadge, StatusBadge } from "@/components/badges";
import { DraftEditor } from "@/components/draft-editor";
import type { OpportunityListItem } from "@/components/opportunity-list";

export function OpportunityDetail({ opportunity }: { opportunity: OpportunityListItem }) {
  const { contactName, contactRole, contactLinkedinUrl } = opportunity;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold break-all">{opportunity.domain}</h2>
          <StatusBadge status={opportunity.status} />
        </div>
        <OutboundLink href={opportunity.linkingPageUrl}>{opportunity.linkingPageTitle}</OutboundLink>
        {opportunity.issues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {opportunity.issues.map((issue) => (
              <QualityIssueBadge key={issue} issue={issue} />
            ))}
          </div>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Fact label="Relevance score" value={opportunity.relevanceScore} />
        <Fact label="Domain rating" value={opportunity.domainRating} />
        <Fact label="Topic" value={opportunity.topic.trim()} />
        <Fact label="Links to" value={opportunity.competitorLinked} />
      </dl>

      <section className="space-y-1">
        <h3 className="text-sm font-medium">Contact</h3>
        {!contactName && !contactLinkedinUrl ? (
          <p className="text-sm text-muted-foreground">No contact found.</p>
        ) : (
          <>
            {contactName && (
              <p className="text-sm">
                {contactName}
                {contactRole && <span className="text-muted-foreground"> · {contactRole}</span>}
              </p>
            )}
            {contactLinkedinUrl && <OutboundLink href={contactLinkedinUrl}>LinkedIn profile</OutboundLink>}
          </>
        )}
      </section>

      {/* The key gives every opportunity a fresh editor, so text never leaks between rows. */}
      <DraftEditor
        key={opportunity.id}
        id={opportunity.id}
        savedDraft={opportunity.draft}
        originalDraft={opportunity.originalDraft}
      />
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

/** Links to sites from the data open in a new tab and share nothing about this app. */
function OutboundLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {children}
      <ExternalLink aria-hidden className="size-3.5 shrink-0" />
    </a>
  );
}
