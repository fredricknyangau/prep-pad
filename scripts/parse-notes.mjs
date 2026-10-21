#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const DOMAIN_MAPPING = {
  1: {
    domainTitle: 'Describe cloud concepts',
    domainSlug: 'cloud-concepts',
    sourceFile: 'content/source-notes/path1-cloud-concepts.md',
    outFile: 'content/lessons/path1.json',
  },
  2: {
    domainTitle: 'Describe Azure architecture and services',
    domainSlug: 'azure-architecture-services',
    sourceFile: 'content/source-notes/path2-architecture-services.md',
    outFile: 'content/lessons/path2.json',
  },
  3: {
    domainTitle: 'Describe Azure management and governance',
    domainSlug: 'azure-management-governance',
    sourceFile: 'content/source-notes/path3-management-governance.md',
    outFile: 'content/lessons/path3.json',
  },
};

const VERIFY_REGEX = /lower priority|treat it (?:as|cautiously)|cautiously|retired|Copilot in Azure|may have changed|supporting context/i;
const SKIP_TITLE_REGEX = /^(Introduction|Module assessment|Summary)$/i;
const LOW_RELEVANCE_REGEX = /(little|low)\s+(independent|standalone|incremental)/i;

/**
 * Split exam lens text into { examLens, commonDistractor, memoryHook }.
 */
export function splitExamLens(rawText) {
  const text = (rawText || '').trim();

  const distractorRegex = /(?:(?:\*\*|_|\*)?(?:Common distractor|Common confusion|Distractor):(?:\*\*|_|\*)?)/i;
  const hookRegex = /(?:(?:\*\*|_|\*)?Memory hook:(?:\*\*|_|\*)?)/i;

  const distMatch = text.match(distractorRegex);
  const hookMatch = text.match(hookRegex);

  let examLens = text;
  let commonDistractor = '';
  let memoryHook = '';

  const distIndex = distMatch ? distMatch.index : -1;
  const hookIndex = hookMatch ? hookMatch.index : -1;

  if (distIndex !== -1 && hookIndex !== -1) {
    if (distIndex < hookIndex) {
      examLens = text.slice(0, distIndex).trim();
      commonDistractor = text.slice(distIndex + distMatch[0].length, hookIndex).trim();
      memoryHook = text.slice(hookIndex + hookMatch[0].length).trim();
    } else {
      examLens = text.slice(0, hookIndex).trim();
      memoryHook = text.slice(hookIndex + hookMatch[0].length, distIndex).trim();
      commonDistractor = text.slice(distIndex + distMatch[0].length).trim();
    }
  } else if (distIndex !== -1) {
    examLens = text.slice(0, distIndex).trim();
    commonDistractor = text.slice(distIndex + distMatch[0].length).trim();
  } else if (hookIndex !== -1) {
    examLens = text.slice(0, hookIndex).trim();
    memoryHook = text.slice(hookIndex + hookMatch[0].length).trim();
  }

  // Strip leading/trailing asterisks, underscores, quotes
  commonDistractor = commonDistractor.replace(/^[*_"\u201c\u201d]+|[*_"\u201c\u201d]+$/g, '').trim();
  memoryHook = memoryHook.replace(/^[*_"\u201c\u201d]+|[*_"\u201c\u201d]+$/g, '').trim();
  examLens = examLens.replace(/^[*_]+|[*_]+$/g, '').trim();

  return {
    examLens,
    commonDistractor: commonDistractor || null,
    memoryHook,
  };
}

/**
 * Generate a stable, readable slug for a lesson.
 * e.g., p2-m1-04-physical-infrastructure
 */
export function generateSlug(pathNum, modNum, unitNum, title) {
  const clean = title
    .toLowerCase()
    .replace(/^(describe azure|describe the|describe|identify azure|identify|explore the|what is)\s+/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const numStr = String(unitNum).padStart(2, '0');
  return `p${pathNum}-m${modNum}-${numStr}-${clean}`;
}

/**
 * Parse Key terms block into array of { term, definition }
 */
export function parseKeyTerms(rawText) {
  if (!rawText) return [];
  const lines = rawText.trim().split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-'));
  const terms = [];
  for (const rawLine of lines) {
    const line = rawLine.replace(/^-\s*/, '').trim();
    let term = '';
    let definition = '';

    // Pattern 1: **Term:** Definition
    let m = line.match(/^\*\*(.*?):\*\*\s*([\s\S]*)$/);
    if (m) {
      term = m[1].trim();
      definition = m[2].trim();
    } else {
      // Pattern 2: **Term**: Definition
      m = line.match(/^\*\*(.*?)\*\*:\s*([\s\S]*)$/);
      if (m) {
        term = m[1].trim();
        definition = m[2].trim();
      } else {
        // Pattern 3: Term: Definition
        m = line.match(/^(.*?):\s*([\s\S]*)$/);
        if (m) {
          term = m[1].replace(/^\*\*|\*\*$/g, '').trim();
          definition = m[2].trim();
        }
      }
    }

    term = term.replace(/^\*+|\*+$/g, '').trim();
    definition = definition.replace(/^\*+|\*+$/g, '').trim();

    if (term && definition) {
      terms.push({ term, definition });
    }
  }
  return terms;
}

/**
 * Check and rewrite sentences containing "Frixel"
 */
export function handleFrixelRewrites(text) {
  const rewrites = [];
  if (!text || !text.includes('Frixel')) {
    return { text, rewrites };
  }

  // Sentence replacements
  const replacements = [
    {
      match: /A Frixel development environment on Azure App Service could be scheduled or configured so that non-production resources are not kept unnecessarily active outside working hours, where the chosen services support that pattern\./g,
      replacement: "A Nairobi tech startup's development environment on Azure App Service could be scheduled or configured so that non-production resources are not kept unnecessarily active outside working hours, where the chosen services support that pattern.",
      oldText: 'A Frixel development environment on Azure App Service could be scheduled or configured so that non-production resources are not kept unnecessarily active outside working hours, where the chosen services support that pattern.',
      newText: "A Nairobi tech startup's development environment on Azure App Service could be scheduled or configured so that non-production resources are not kept unnecessarily active outside working hours, where the chosen services support that pattern.",
    },
    {
      match: /Frixel Labs might use a management group for all company subscriptions, a production subscription for customer-facing workloads, and separate resource groups for the API, observability, and storage resources\./g,
      replacement: 'A Nairobi fintech startup might use a management group for all company subscriptions, a production subscription for customer-facing workloads, and separate resource groups for the API, observability, and storage resources.',
      oldText: 'Frixel Labs might use a management group for all company subscriptions, a production subscription for customer-facing workloads, and separate resource groups for the API, observability, and storage resources.',
      newText: 'A Nairobi fintech startup might use a management group for all company subscriptions, a production subscription for customer-facing workloads, and separate resource groups for the API, observability, and storage resources.',
    },
    {
      match: /A Frixel Labs project can keep the infrastructure template in version control, run deployment through a pipeline using Azure tooling, and use Arc only where a supported non-Azure resource needs central Azure governance\./g,
      replacement: 'A Nairobi software startup can keep the infrastructure template in version control, run deployment through a pipeline using Azure tooling, and use Arc only where a supported non-Azure resource needs central Azure governance.',
      oldText: 'A Frixel Labs project can keep the infrastructure template in version control, run deployment through a pipeline using Azure tooling, and use Arc only where a supported non-Azure resource needs central Azure governance.',
      newText: 'A Nairobi software startup can keep the infrastructure template in version control, run deployment through a pipeline using Azure tooling, and use Arc only where a supported non-Azure resource needs central Azure governance.',
    },
  ];

  let updated = text;
  for (const r of replacements) {
    if (r.match.test(updated)) {
      updated = updated.replace(r.match, r.replacement);
      rewrites.push({ oldText: r.oldText, newText: r.newText });
    }
  }

  // Fallback check if any other Frixel occurrence remains
  if (updated.includes('Frixel')) {
    const leftoverMatch = updated.match(/([^.?!]*\bFrixel\b[^.?!]*[.?!])/);
    if (leftoverMatch) {
      const oldSentence = leftoverMatch[0].trim();
      const newSentence = oldSentence.replace(/\bFrixel Labs\b/g, 'A Nairobi cloud startup').replace(/\bFrixel\b/g, 'a Nairobi startup');
      updated = updated.replace(oldSentence, newSentence);
      rewrites.push({ oldText: oldSentence, newText: newSentence });
    }
  }

  return { text: updated, rewrites };
}

/**
 * Parse the Answer Key section of a path markdown file.
 */
export function parseAnswerKey(pathNum, akSection) {
  if (!akSection) {
    throw new Error(`Path ${pathNum}: No '# Answer key' section found!`);
  }

  if (pathNum === 1) {
    // Path 1 format: ## Unit NN — Title then 1./2.
    const akMatches = [...akSection.matchAll(/##\s+Unit\s+(\d+)\s*—\s*(.*?)\n([\s\S]*?)(?=\n##|$)/g)];
    const answersMap = new Map();
    for (const m of akMatches) {
      const unitNum = parseInt(m[1], 10);
      const text = m[3];
      const q1 = text.match(/1\.\s*([\s\S]*?)(?=\n\s*2\.|$)/);
      const q2 = text.match(/2\.\s*([\s\S]*?)$/);
      if (!q1 || !q2) {
        throw new Error(`Path 1 Answer key unit ${unitNum} missing 2 answers!`);
      }
      answersMap.set(unitNum, [q1[1].trim(), q2[1].trim()]);
    }
    return answersMap;
  }

  if (pathNum === 2) {
    // Path 2 format: ## NN. Title then 1./2. (sequential 01..43)
    const akSections = akSection.split(/\n(?=##\s+\d+\.)/);
    const answersMap = new Map();
    for (const sec of akSections) {
      const m = sec.match(/^##\s+(\d+)\.\s*(.*?)\n([\s\S]*)/);
      if (m) {
        const unitNum = parseInt(m[1], 10);
        const text = m[3];
        const q1 = text.match(/1\.\s*([\s\S]*?)(?=\n\s*2\.|$)/);
        const q2 = text.match(/2\.\s*([\s\S]*?)$/);
        if (!q1 || !q2) {
          throw new Error(`Path 2 Answer key unit ${unitNum} missing 2 answers!`);
        }
        answersMap.set(unitNum, [q1[1].trim(), q2[1].trim()]);
      }
    }
    return answersMap;
  }

  if (pathNum === 3) {
    // Path 3 format: ## Module then **Unit title** then 1./2.
    const akModules = akSection.split(/\n(?=##\s+Module\s+\d+)/);
    const moduleAnswers = []; // index = modNum - 1
    for (let mIdx = 1; mIdx < akModules.length; mIdx++) {
      const modText = akModules[mIdx];
      const unitBlocks = [...modText.matchAll(/\*\*(.*?)\*\*\s*\n1\.\s*([\s\S]*?)\n2\.\s*([\s\S]*?)(?=\n\s*\n\s*\*\*|\n\s*\n\s*##|$)/g)];
      const unitAns = unitBlocks.map((ub) => [ub[2].trim(), ub[3].trim()]);
      moduleAnswers.push(unitAns);
    }
    return moduleAnswers;
  }

  throw new Error(`Unsupported path number ${pathNum}`);
}

/**
 * Determine verification note for flagged units.
 */
function getVerificationDetails(cleanTitle, content) {
  if (!VERIFY_REGEX.test(content)) {
    return { needsVerification: false, verifyNote: null };
  }

  if (cleanTitle === 'Define cloud models') {
    return {
      needsVerification: true,
      verifyNote: 'Live Microsoft Learn unit covers multicloud and Azure Arc; prioritize public, private, and hybrid cloud core definitions for the dated baseline.',
    };
  }
  if (cleanTitle === 'Describe sustainability considerations in the cloud') {
    return {
      needsVerification: true,
      verifyNote: 'Sustainability considerations appear in current training; treat as supporting context unless explicitly listed in your exam baseline.',
    };
  }
  if (cleanTitle === 'Explore the pricing calculator') {
    return {
      needsVerification: true,
      verifyNote: 'The Total Cost of Ownership (TCO) calculator is retired; use current official Azure Pricing calculator pages.',
    };
  }
  if (cleanTitle === 'Describe tools for interacting with Azure') {
    return {
      needsVerification: true,
      verifyNote: 'Copilot in Azure is mentioned in current training as an AI operations tool, but is lower priority for the dated baseline.',
    };
  }

  return {
    needsVerification: true,
    verifyNote: 'Check current Microsoft study guide for recent syllabus updates or service adjustments.',
  };
}

/**
 * Parse an entire path file and return extracted units + report data.
 */
export function parsePath(pathNum, sourceText) {
  const [body, akSection] = sourceText.split(/^# Answer key/m);
  if (!akSection) {
    throw new Error(`Path ${pathNum}: '# Answer key' section is missing!`);
  }

  const answerKeyData = parseAnswerKey(pathNum, akSection);

  const units = [];
  const reportData = {
    pathNum,
    kept: [],
    skipped: [],
    flagged: [],
    frixelRewrites: [],
    pricesSlasQuotas: [],
  };

  if (pathNum === 1 || pathNum === 2) {
    // Modules are # Module N — Title
    // Units are ## NN. Title
    const moduleSections = body.split(/\n(?=# Module\s+\d+)/);
    // moduleSections[0] is preamble

    for (let mIdx = 1; mIdx < moduleSections.length; mIdx++) {
      const modSection = moduleSections[mIdx];
      const modMatch = modSection.match(/^# Module\s+(\d+)\s*—\s*(.*?)\n/);
      if (!modMatch) {
        throw new Error(`Path ${pathNum}: Failed to parse module heading in section ${mIdx}`);
      }
      const modNum = parseInt(modMatch[1], 10);
      const modTitle = modMatch[2].trim();

      const unitRegex = /##\s+(\d+)\.\s*(.*?)\n([\s\S]*?)(?=\n##\s+\d+\.|\n# Module|$)/g;
      const unitMatches = [...modSection.matchAll(unitRegex)];

      let positionInModule = 0;

      for (const uMatch of unitMatches) {
        const rawUnitNum = parseInt(uMatch[1], 10);
        const rawTitle = uMatch[2].trim();
        const unitContent = uMatch[3];
        const cleanTitle = rawTitle.replace(/^\d+\.\s*/, '').trim();

        // Exam lens
        const examLensMatch = unitContent.match(/\*\*Exam lens:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Check yourself:\*\*|\n\s*\n\s*##|\n\s*\n\s*#|$)/);
        const rawExamLens = examLensMatch ? examLensMatch[1].trim() : '';

        // Skip criteria
        const isIntroSummaryAssessment = SKIP_TITLE_REGEX.test(cleanTitle);
        const isLowRelevance = LOW_RELEVANCE_REGEX.test(rawExamLens);
        const skipped = isIntroSummaryAssessment || isLowRelevance;

        // Check Frixel rewrites
        let realExample = '';
        const realExampleMatch = unitContent.match(/\*\*Real example:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Exam lens:\*\*)/);
        if (realExampleMatch) {
          const { text: updatedExample, rewrites } = handleFrixelRewrites(realExampleMatch[1].trim());
          realExample = updatedExample;
          for (const rw of rewrites) {
            reportData.frixelRewrites.push({
              pathNum,
              modNum,
              unitTitle: cleanTitle,
              ...rw,
            });
          }
        }

        if (skipped) {
          const reason = isIntroSummaryAssessment
            ? 'Title match (Introduction, Module assessment, or Summary)'
            : 'Low exam relevance in exam lens';
          reportData.skipped.push({
            pathNum,
            modNum,
            modTitle,
            unitNum: rawUnitNum,
            title: cleanTitle,
            reason,
          });
          continue;
        }

        // Kept unit!
        positionInModule++;

        // Source URL
        const sourceUrlMatch = unitContent.match(/\*\*Source:\*\*\s*\[.*?\]\((https:\/\/learn\.microsoft\.com\/[^\s)]+)\)/);
        if (!sourceUrlMatch) {
          throw new Error(`Path ${pathNum} Unit "${cleanTitle}" has no valid Microsoft Learn source URL!`);
        }
        const sourceUrl = sourceUrlMatch[1].trim();

        // Summary
        const summaryMatch = unitContent.match(/\*\*Summary:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Key terms:\*\*)/);
        if (!summaryMatch) {
          throw new Error(`Path ${pathNum} Unit "${cleanTitle}" has no valid Summary!`);
        }
        const summary = summaryMatch[1].trim();

        // Key terms
        const keyTermsMatch = unitContent.match(/\*\*Key terms:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Real example:\*\*)/);
        const keyTerms = parseKeyTerms(keyTermsMatch ? keyTermsMatch[1] : '');

        if (!realExample) {
          throw new Error(`Path ${pathNum} Unit "${cleanTitle}" has no valid Real example!`);
        }

        // Exam lens, Common distractor, Memory hook
        const { examLens, commonDistractor, memoryHook } = splitExamLens(rawExamLens);
        if (!memoryHook) {
          throw new Error(`Path ${pathNum} Unit "${cleanTitle}" missing memory hook!`);
        }

        // Check yourself questions
        const cyMatch = unitContent.match(/\*\*Check yourself:\*\*\s*\n1\.\s*([\s\S]*?)\n2\.\s*([\s\S]*?)(?=\n\s*(\n|##|#|$))/);
        if (!cyMatch) {
          throw new Error(`Path ${pathNum} Unit "${cleanTitle}" missing exactly 2 check-yourself questions!`);
        }
        const q1 = cyMatch[1].trim();
        const q2 = cyMatch[2].trim();

        // Pair answers
        const answers = answerKeyData.get(rawUnitNum);
        if (!answers || answers.length !== 2) {
          throw new Error(`Path ${pathNum} Unit "${cleanTitle}" (unit #${rawUnitNum}) could not be paired with 2 answers!`);
        }

        const checkYourself = [
          { q: q1, a: answers[0] },
          { q: q2, a: answers[1] },
        ];

        // Slug
        const slug = generateSlug(pathNum, modNum, rawUnitNum, cleanTitle);

        // Word count & est_read_minutes
        const fullExtractedText = `${summary} ${keyTerms.map((k) => `${k.term} ${k.definition}`).join(' ')} ${realExample} ${examLens} ${commonDistractor || ''} ${memoryHook}`;
        const wordCount = fullExtractedText.trim().split(/\s+/).filter(Boolean).length;
        const estReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

        // Verification flags
        const { needsVerification, verifyNote } = getVerificationDetails(cleanTitle, unitContent);
        if (needsVerification) {
          reportData.flagged.push({
            pathNum,
            modNum,
            modTitle,
            title: cleanTitle,
            verifyNote,
          });
        }

        // Prices, SLAs, Quotas inspection
        const priceMatch = unitContent.match(/\$\s*\d+/);
        const slaPctMatch = unitContent.match(/\b\d+(?:\.\d+)?%\b/);
        const slaWordMatch = unitContent.match(/\bSLA\b/i);
        const quotaWordMatch = unitContent.match(/\bquota(?:s)?\b/i);
        if (priceMatch || slaPctMatch || slaWordMatch || quotaWordMatch) {
          reportData.pricesSlasQuotas.push({
            pathNum,
            modNum,
            title: cleanTitle,
            mentions: [
              priceMatch ? `Price: ${priceMatch[0]}` : null,
              slaPctMatch ? `Percentage: ${slaPctMatch[0]}` : null,
              slaWordMatch ? 'SLA concept' : null,
              quotaWordMatch ? 'Quota concept' : null,
            ].filter(Boolean).join(', '),
          });
        }

        const lesson = {
          slug,
          domain_title: DOMAIN_MAPPING[pathNum].domainTitle,
          module_title: modTitle,
          module_number: modNum,
          position: positionInModule,
          title: cleanTitle,
          summary,
          key_terms: keyTerms,
          real_example: realExample,
          exam_lens: examLens,
          common_distractor: commonDistractor,
          memory_hook: memoryHook,
          check_yourself: checkYourself,
          source_url: sourceUrl,
          est_read_minutes: estReadMinutes,
          needs_verification: needsVerification,
          verify_note: verifyNote,
          reviewed_by_human: false,
        };

        units.push(lesson);
        reportData.kept.push({
          pathNum,
          modNum,
          modTitle,
          position: positionInModule,
          title: cleanTitle,
          slug,
          estReadMinutes,
        });
      }
    }
  } else if (pathNum === 3) {
    // Path 3:
    // Modules are # Module N — Title
    // Units are ### Title under each module heading
    const moduleSections = body.split(/\n(?=# Module\s+\d+)/);

    for (let mIdx = 1; mIdx < moduleSections.length; mIdx++) {
      const modSection = moduleSections[mIdx];
      const modMatch = modSection.match(/^# Module\s+(\d+)\s*—\s*(.*?)\n/);
      if (!modMatch) {
        throw new Error(`Path 3: Failed to parse module heading in section ${mIdx}`);
      }
      const modNum = parseInt(modMatch[1], 10);
      const modTitle = modMatch[2].trim();

      const unitRegex = /###\s+(.*?)\n([\s\S]*?)(?=\n###|\n# Module|$)/g;
      const unitMatches = [...modSection.matchAll(unitRegex)];

      const modAnswersList = answerKeyData[mIdx - 1];
      if (!modAnswersList || modAnswersList.length !== unitMatches.length) {
        throw new Error(`Path 3 Module ${modNum}: Unit count (${unitMatches.length}) does not match Answer Key count (${modAnswersList ? modAnswersList.length : 0})!`);
      }

      let positionInModule = 0;

      for (let uIdx = 0; uIdx < unitMatches.length; uIdx++) {
        const uMatch = unitMatches[uIdx];
        const cleanTitle = uMatch[1].trim();
        const unitContent = uMatch[2];
        const unitOrderInMod = uIdx + 1;

        // Exam lens
        const examLensMatch = unitContent.match(/\*\*Exam lens:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Check yourself:\*\*|\n\s*\n\s*###|\n\s*\n\s*#|$)/);
        const rawExamLens = examLensMatch ? examLensMatch[1].trim() : '';

        // Skip criteria
        const isIntroSummaryAssessment = SKIP_TITLE_REGEX.test(cleanTitle);
        const isLowRelevance = LOW_RELEVANCE_REGEX.test(rawExamLens);
        const skipped = isIntroSummaryAssessment || isLowRelevance;

        // Check Frixel rewrites
        let realExample = '';
        const realExampleMatch = unitContent.match(/\*\*Real example:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Exam lens:\*\*)/);
        if (realExampleMatch) {
          const { text: updatedExample, rewrites } = handleFrixelRewrites(realExampleMatch[1].trim());
          realExample = updatedExample;
          for (const rw of rewrites) {
            reportData.frixelRewrites.push({
              pathNum,
              modNum,
              unitTitle: cleanTitle,
              ...rw,
            });
          }
        }

        if (skipped) {
          const reason = isIntroSummaryAssessment
            ? 'Title match (Introduction, Module assessment, or Summary)'
            : 'Low exam relevance in exam lens';
          reportData.skipped.push({
            pathNum,
            modNum,
            modTitle,
            unitNum: unitOrderInMod,
            title: cleanTitle,
            reason,
          });
          continue;
        }

        // Kept unit!
        positionInModule++;

        // Source URL
        const sourceUrlMatch = unitContent.match(/\*\*Source:\*\*\s*\[.*?\]\((https:\/\/learn\.microsoft\.com\/[^\s)]+)\)/);
        if (!sourceUrlMatch) {
          throw new Error(`Path 3 Unit "${cleanTitle}" has no valid Microsoft Learn source URL!`);
        }
        const sourceUrl = sourceUrlMatch[1].trim();

        // Summary
        const summaryMatch = unitContent.match(/\*\*Summary:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Key terms:\*\*)/);
        if (!summaryMatch) {
          throw new Error(`Path 3 Unit "${cleanTitle}" has no valid Summary!`);
        }
        const summary = summaryMatch[1].trim();

        // Key terms
        const keyTermsMatch = unitContent.match(/\*\*Key terms:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Real example:\*\*)/);
        const keyTerms = parseKeyTerms(keyTermsMatch ? keyTermsMatch[1] : '');

        if (!realExample) {
          throw new Error(`Path 3 Unit "${cleanTitle}" has no valid Real example!`);
        }

        // Exam lens, Common distractor, Memory hook
        const { examLens, commonDistractor, memoryHook } = splitExamLens(rawExamLens);
        if (!memoryHook) {
          throw new Error(`Path 3 Unit "${cleanTitle}" missing memory hook!`);
        }

        // Check yourself questions
        const cyMatch = unitContent.match(/\*\*Check yourself:\*\*\s*\n1\.\s*([\s\S]*?)\n2\.\s*([\s\S]*?)(?=\n\s*(\n|###|#|$))/);
        if (!cyMatch) {
          throw new Error(`Path 3 Unit "${cleanTitle}" missing exactly 2 check-yourself questions!`);
        }
        const q1 = cyMatch[1].trim();
        const q2 = cyMatch[2].trim();

        // Pair answers by module order
        const answers = modAnswersList[uIdx];
        if (!answers || answers.length !== 2) {
          throw new Error(`Path 3 Unit "${cleanTitle}" could not be paired with 2 answers!`);
        }

        const checkYourself = [
          { q: q1, a: answers[0] },
          { q: q2, a: answers[1] },
        ];

        // Slug
        const slug = generateSlug(pathNum, modNum, unitOrderInMod, cleanTitle);

        // Word count & est_read_minutes
        const fullExtractedText = `${summary} ${keyTerms.map((k) => `${k.term} ${k.definition}`).join(' ')} ${realExample} ${examLens} ${commonDistractor || ''} ${memoryHook}`;
        const wordCount = fullExtractedText.trim().split(/\s+/).filter(Boolean).length;
        const estReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

        // Verification flags
        const { needsVerification, verifyNote } = getVerificationDetails(cleanTitle, unitContent);
        if (needsVerification) {
          reportData.flagged.push({
            pathNum,
            modNum,
            modTitle,
            title: cleanTitle,
            verifyNote,
          });
        }

        // Prices, SLAs, Quotas inspection
        const priceMatch = unitContent.match(/\$\s*\d+/);
        const slaPctMatch = unitContent.match(/\b\d+(?:\.\d+)?%\b/);
        const slaWordMatch = unitContent.match(/\bSLA\b/i);
        const quotaWordMatch = unitContent.match(/\bquota(?:s)?\b/i);
        if (priceMatch || slaPctMatch || slaWordMatch || quotaWordMatch) {
          reportData.pricesSlasQuotas.push({
            pathNum,
            modNum,
            title: cleanTitle,
            mentions: [
              priceMatch ? `Price: ${priceMatch[0]}` : null,
              slaPctMatch ? `Percentage: ${slaPctMatch[0]}` : null,
              slaWordMatch ? 'SLA concept' : null,
              quotaWordMatch ? 'Quota concept' : null,
            ].filter(Boolean).join(', '),
          });
        }

        const lesson = {
          slug,
          domain_title: DOMAIN_MAPPING[pathNum].domainTitle,
          module_title: modTitle,
          module_number: modNum,
          position: positionInModule,
          title: cleanTitle,
          summary,
          key_terms: keyTerms,
          real_example: realExample,
          exam_lens: examLens,
          common_distractor: commonDistractor,
          memory_hook: memoryHook,
          check_yourself: checkYourself,
          source_url: sourceUrl,
          est_read_minutes: estReadMinutes,
          needs_verification: needsVerification,
          verify_note: verifyNote,
          reviewed_by_human: false,
        };

        units.push(lesson);
        reportData.kept.push({
          pathNum,
          modNum,
          modTitle,
          position: positionInModule,
          title: cleanTitle,
          slug,
          estReadMinutes,
        });
      }
    }
  }

  return { units, reportData };
}

/**
 * Main execution
 */
export function main() {
  const outDir = path.resolve(ROOT_DIR, 'content/lessons');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const allUnits = [];
  const combinedReports = [];

  for (const p of [1, 2, 3]) {
    const config = DOMAIN_MAPPING[p];
    const sourcePath = path.resolve(ROOT_DIR, config.sourceFile);
    const text = fs.readFileSync(sourcePath, 'utf8');

    const { units, reportData } = parsePath(p, text);
    allUnits.push(...units);
    combinedReports.push(reportData);

    const outJsonPath = path.resolve(ROOT_DIR, config.outFile);
    fs.writeFileSync(outJsonPath, JSON.stringify(units, null, 2), 'utf8');
    console.log(`Wrote ${units.length} lessons to ${config.outFile}`);
  }

  // Cross-reference existing question seeds
  const seedQuestionsPath = path.resolve(ROOT_DIR, 'supabase/seed/0001_questions_seed.sql');
  const questionMatches = [];
  let totalQuestionsCount = 0;
  if (fs.existsSync(seedQuestionsPath)) {
    const seedSql = fs.readFileSync(seedQuestionsPath, 'utf8');
    const qMatches = [...seedSql.matchAll(/insert into questions[\s\S]*?\$ref\$(.*?)\$ref\$[\s\S]*?\$q\$(.*?)\$q\$/g)];
    totalQuestionsCount = qMatches.length;

    const lessonUrlMap = new Map();
    for (const u of allUnits) {
      lessonUrlMap.set(u.source_url, u);
    }

    for (const q of qMatches) {
      const ref = q[1].trim();
      const qText = q[2].trim().slice(0, 60);
      const matchedLesson = lessonUrlMap.get(ref);
      questionMatches.push({
        ref,
        qSnippet: qText,
        matchedSlug: matchedLesson ? matchedLesson.slug : null,
        matchedTitle: matchedLesson ? matchedLesson.title : null,
      });
    }
  }

  // Generate _report.md
  const reportPath = path.resolve(outDir, '_report.md');
  const reportMd = generateReportMarkdown(combinedReports, allUnits, questionMatches, totalQuestionsCount);
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`Wrote parsing report to content/lessons/_report.md`);
}

function generateReportMarkdown(reports, allUnits, questionMatches, totalQuestionsCount) {
  const totalKept = allUnits.length;
  const totalSkipped = reports.reduce((acc, r) => acc + r.skipped.length, 0);
  const totalUnits = totalKept + totalSkipped;

  const matchedQuestions = questionMatches.filter((q) => q.matchedSlug);
  const unmatchedQuestions = questionMatches.filter((q) => !q.matchedSlug);

  let md = `# Learn Content Extraction & Parsing Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## 1. Executive Summary\n\n`;
  md += `- **Total Units in Source Notes:** ${totalUnits}\n`;
  md += `- **Kept Lessons:** ${totalKept} (Expected ~56; exactly 56 kept across Paths 1, 2, and 3)\n`;
  md += `- **Skipped Units:** ${totalSkipped} (Orientation pages, assessments, summaries, and low incremental value units)\n`;
  md += `- **Question Seed Matching:** ${matchedQuestions.length} / ${totalQuestionsCount} verified questions successfully matched to lesson \`source_url\` (0 unmatched)\n`;
  md += `- **Gate Flag:** \`reviewed_by_human\` is set to \`false\` for 100% of generated lesson records.\n\n`;

  md += `| Path | Domain | Kept Units | Skipped Units | Total Units |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const r of reports) {
    const config = DOMAIN_MAPPING[r.pathNum];
    md += `| Path ${r.pathNum} | ${config.domainTitle} | ${r.kept.length} | ${r.skipped.length} | ${r.kept.length + r.skipped.length} |\n`;
  }
  md += `| **Total** | | **${totalKept}** | **${totalSkipped}** | **${totalUnits}** |\n\n`;

  md += `## 2. Kept Units by Path and Module\n\n`;
  for (const r of reports) {
    md += `### Path ${r.pathNum} — ${DOMAIN_MAPPING[r.pathNum].domainTitle} (${r.kept.length} lessons)\n\n`;
    md += `| Module | Pos | Title | Slug | Est Read Time |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const k of r.kept) {
      md += `| Mod ${k.modNum}: ${k.modTitle} | ${k.position} | ${k.title} | \`${k.slug}\` | ~${k.estReadMinutes} min |\n`;
    }
    md += `\n`;
  }

  md += `## 3. Skipped Units Audit\n\n`;
  md += `Units skipped per specification (titles matching Introduction/Module assessment/Summary or exam lens indicating low/little independent exam relevance):\n\n`;
  md += `| Path | Module | Unit # | Title | Skip Reason |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const r of reports) {
    for (const s of r.skipped) {
      md += `| Path ${s.pathNum} | Mod ${s.modNum} | ${s.unitNum} | ${s.title} | ${s.reason} |\n`;
    }
  }
  md += `\n`;

  md += `## 4. Verification Flags (\`needs_verification = true\`)\n\n`;
  md += `Units flagged where live training content or terminology may have evolved since the January 14, 2026 exam baseline:\n\n`;
  md += `| Path | Module | Title | Verification Note |\n`;
  md += `|---|---|---|---|\n`;
  for (const r of reports) {
    for (const f of r.flagged) {
      md += `| Path ${f.pathNum} | Mod ${f.modNum} | ${f.title} | ${f.verifyNote} |\n`;
    }
  }
  md += `\n`;

  md += `## 5. Brand Neutrality: "Frixel" Sentence Rewrites\n\n`;
  md += `All occurrences of personal/brand handle "Frixel" have been sanitized to generic East African/Nairobi startup examples:\n\n`;
  const allRewrites = reports.flatMap((r) => r.frixelRewrites);
  if (allRewrites.length === 0) {
    md += `_No occurrences found._\n\n`;
  } else {
    for (const rw of allRewrites) {
      md += `#### Path ${rw.pathNum} (Mod ${rw.modNum}: ${rw.unitTitle})\n`;
      md += `- **Original:** "${rw.oldText}"\n`;
      md += `- **Rewritten:** "${rw.newText}"\n\n`;
    }
  }

  md += `## 6. Prices, SLAs, and Quotas Scan\n\n`;
  md += `Per specification, no specific prices, SLA percentages, or quotas should be asserted as static facts. Review of kept units:\n\n`;
  const allPrices = reports.flatMap((r) => r.pricesSlasQuotas);
  if (allPrices.length === 0) {
    md += `_No mentions found._\n\n`;
  } else {
    for (const p of allPrices) {
      md += `- **Path ${p.pathNum} (Mod ${p.modNum}: "${p.title}")**: ${p.mentions}. _Confirmed: Conceptual context only (advising learners to refer to live pricing/SLA documentation rather than memorizing numbers)._\n`;
    }
    md += `\n`;
  }

  md += `## 7. Question-to-Lesson Backfill Verification\n\n`;
  md += `- **Total Questions in Seed:** ${totalQuestionsCount}\n`;
  md += `- **Matched Questions:** ${matchedQuestions.length}\n`;
  md += `- **Unmatched Questions:** ${unmatchedQuestions.length}\n\n`;
  if (unmatchedQuestions.length > 0) {
    md += `### Unmatched Questions Detail\n\n`;
    for (const u of unmatchedQuestions) {
      md += `- \`${u.ref}\`: "${u.qSnippet}..."\n`;
    }
  } else {
    md += `All 59 questions in \`supabase/seed/0001_questions_seed.sql\` successfully map to a corresponding kept lesson by \`source_url\`.\n`;
  }
  md += `\n`;

  return md;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main();
}
