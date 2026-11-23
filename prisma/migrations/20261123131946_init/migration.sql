-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "domainRating" INTEGER NOT NULL,
    "linkingPageTitle" TEXT NOT NULL,
    "linkingPageUrl" TEXT NOT NULL,
    "competitorLinked" TEXT NOT NULL,
    "contactName" TEXT,
    "contactRole" TEXT,
    "contactLinkedinUrl" TEXT,
    "relevanceScore" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "alreadyContacted" BOOLEAN NOT NULL DEFAULT false,
    "originalDraft" TEXT NOT NULL,
    "draft" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TO_REVIEW',
    "updatedAt" DATETIME NOT NULL
);
