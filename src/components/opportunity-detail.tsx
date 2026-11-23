import {
  CircleCheck,
  CircleMinus,
  ExternalLink,
  type LucideIcon,
  TriangleAlert,
} from "lucide-react";
import { QualityIssueBadge, StatusBadge } from "@/components/badges";
import { DraftEditor } from "@/components/draft-editor";
import type { OpportunityListItem } from "@/components/opportunity-list";
import { explainScore, type ScoreSignal } from "@/lib/explain";
import { hasContact } from "@/lib/quality";
import { getRewriter } from "@/lib/rewrite";

type OpportunityDetailProps = {
  opportunity: OpportunityListItem;
  /** Other opportunities on the same domain. */
  sameDomainIds: string[];
};

export function OpportunityDetail({ opportunity, sameDomainIds }: OpportunityDetailProps) {
  const { contactName, contactRole, contactLinkedinUrl } = opportunity;

  const warnings: string[] = [];
  if (opportunity.alreadyContacted) {
    warnings.push("Already contacted. Approving would send them a second message.");
  }
  if (sameDomainIds.length > 0) {
    warnings.push(
      `Same domain as ${sameDomainIds.join(", ")}. Coordinate so the site is not contacted twice.`,
    );
  }

  return (
    // Two white cards on the warm page: the facts, then the draft and the decision.
    <article className="space-y-4">
      <section className="space-y-6 rounded-2xl border bg-card p-5 md:p-6">
        <header className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight break-all">{opportunity.domain}</h2>
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

        {warnings.length > 0 && (
          <ul className="space-y-2">
            {warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        )}

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Fact label="Relevance score" value={opportunity.relevanceScore} />
          <Fact label="Domain rating" value={opportunity.domainRating} />
          <Fact label="Topic" value={opportunity.topic.trim()} />
          <Fact label="Links to" value={opportunity.competitorLinked} />
        </dl>

        <section className="space-y-2">
          <h3 className="eyebrow">Why this score</h3>
          <ul className="space-y-1.5">
            {explainScore(opportunity).map((signal) => {
              const { Icon, className } = SIGNAL_ICONS[signal.tone];
              return (
                <li key={signal.text} className="flex gap-2 text-sm">
                  <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${className}`} />
                  {signal.text}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-1">
          <h3 className="eyebrow">Contact</h3>
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
      </section>

      <section className="rounded-2xl border bg-card p-5 md:p-6">
        {/* The key gives every opportunity a fresh editor, so text never leaks between rows. */}
        <DraftEditor
          key={opportunity.id}
          id={opportunity.id}
          status={opportunity.status}
          savedDraft={opportunity.draft}
          originalDraft={opportunity.originalDraft}
          canApprove={hasContact(opportunity)}
          rewriterName={getRewriter().name}
        />
      </section>
    </article>
  );
}

/** The text says what each signal means; the icon only repeats it. */
const SIGNAL_ICONS: Record<ScoreSignal["tone"], { Icon: LucideIcon; className: string }> = {
  good: { Icon: CircleCheck, className: "text-emerald-600" },
  neutral: { Icon: CircleMinus, className: "text-muted-foreground" },
  bad: { Icon: TriangleAlert, className: "text-amber-600" },
};

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
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
