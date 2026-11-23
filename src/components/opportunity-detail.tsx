import {
  CircleCheck,
  CircleMinus,
  ExternalLink,
  type LucideIcon,
  TriangleAlert,
  User,
} from "lucide-react";
import { DraftEditor } from "@/components/draft-editor";
import type { OpportunityListItem } from "@/components/opportunity-list";
import { explainScore, type ScoreSignal } from "@/lib/explain";
import { hasContact, QUALITY_ISSUE_LABELS } from "@/lib/quality";
import { getRewriter } from "@/lib/rewrite";

type OpportunityDetailProps = {
  opportunity: OpportunityListItem;
  /** Other opportunities on the same domain. */
  sameDomainIds: string[];
};

export function OpportunityDetail({ opportunity, sameDomainIds }: OpportunityDetailProps) {
  const { contactName, contactRole, contactLinkedinUrl } = opportunity;

  // Everything that should make the reviewer stop and think, in one banner.
  const warnings: string[] = opportunity.issues.map(
    (issue) => `Low quality: ${QUALITY_ISSUE_LABELS[issue]}.`,
  );
  if (opportunity.alreadyContacted) {
    warnings.push("Already contacted. Approving would send them a second message.");
  }
  if (sameDomainIds.length > 0) {
    warnings.push(
      `Same domain as ${sameDomainIds.join(", ")}. Coordinate so the site is not contacted twice.`,
    );
  }

  return (
    // The editor holds the draft text, so it frames the detail: the status
    // control sits at the top and the draft at the bottom, and Approve always
    // saves the text that is on screen. The key gives every opportunity a fresh editor.
    <DraftEditor
      key={opportunity.id}
      id={opportunity.id}
      status={opportunity.status}
      contactName={contactName}
      savedDraft={opportunity.draft}
      originalDraft={opportunity.originalDraft}
      canApprove={hasContact(opportunity)}
      rewriterName={getRewriter().name}
      header={
        <header className="flex min-w-0 flex-1 items-start gap-4">
          {/* Initials of the domain; no logo or favicon is fetched from the site. Hidden when the pane is narrow. */}
          <span
            aria-hidden
            className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground uppercase @md:flex"
          >
            {opportunity.domain.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight break-all @md:text-2xl">{opportunity.domain}</h2>
            <OutboundLink href={opportunity.linkingPageUrl}>{opportunity.linkingPageTitle}</OutboundLink>
          </div>
        </header>
      }
    >
      <dl className="grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <Stat label="Relevance score" value={`${opportunity.relevanceScore} / 100`} />
        <Stat label="Domain rating" value={opportunity.domainRating} />
        <Stat label="Topic" value={opportunity.topic.trim()} />
        <Stat label="Links to" value={opportunity.competitorLinked} />
      </dl>

      {warnings.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <h3 className="flex items-center gap-2 font-medium">
            <TriangleAlert aria-hidden className="size-4" />
            Check before approving
          </h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-10 text-sm">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="flex items-center gap-2 rounded-xl border border-orange-200 bg-accent p-4 text-accent-foreground">
          <CircleCheck aria-hidden className="size-4 shrink-0" />
          <p className="text-sm font-medium">
            No warnings: relevant topic, strong enough site, a contact, and not contacted before.
          </p>
        </section>
      )}

      <div className="grid gap-4 rounded-xl border bg-card p-4 md:p-5 2xl:grid-cols-2">
        <section className="space-y-2">
          <h3 className="eyebrow flex items-center gap-1.5">
            <User aria-hidden className="size-3.5" />
            Contact
          </h3>
          {!contactName && !contactLinkedinUrl ? (
            <p className="text-sm text-muted-foreground">No contact found, so this cannot be approved.</p>
          ) : (
            <div className="space-y-1">
              {contactName && <p className="text-lg font-semibold">{contactName}</p>}
              {contactRole && <p className="text-sm text-muted-foreground">{contactRole}</p>}
              {contactLinkedinUrl && <OutboundLink href={contactLinkedinUrl}>LinkedIn profile</OutboundLink>}
            </div>
          )}
        </section>

        <section className="space-y-2 2xl:border-l 2xl:pl-5">
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
      </div>
    </DraftEditor>
  );
}

/** The text says what each signal means; the icon only repeats it. */
const SIGNAL_ICONS: Record<ScoreSignal["tone"], { Icon: LucideIcon; className: string }> = {
  good: { Icon: CircleCheck, className: "text-emerald-600" },
  neutral: { Icon: CircleMinus, className: "text-muted-foreground" },
  bad: { Icon: TriangleAlert, className: "text-amber-600" },
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl border bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-lg font-semibold" title={String(value)}>{value}</dd>
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
      className="inline-flex items-center gap-1 text-sm text-orange-700 underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink aria-hidden className="size-3.5 shrink-0" />
    </a>
  );
}
