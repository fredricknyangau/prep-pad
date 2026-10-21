import { describe, it, expect } from 'vitest';
import {
  splitExamLens,
  parseKeyTerms,
  generateSlug,
  handleFrixelRewrites,
  parseAnswerKey,
  parsePath,
} from '../scripts/parse-notes.mjs';

describe('Parser Unit Logic & Field Splitting', () => {
  it('splits exam lens into exam_lens, common_distractor, and memory_hook', () => {
    const raw = `Expect scenario-based distinction between shared responsibility and deployment models. **Common confusion:** treating the cloud model as the same thing as the service type. **Memory hook:** *Where it runs is the cloud model; who manages the stack is the service model.*`;

    const result = splitExamLens(raw);

    expect(result.examLens).toBe('Expect scenario-based distinction between shared responsibility and deployment models.');
    expect(result.commonDistractor).toBe('treating the cloud model as the same thing as the service type.');
    expect(result.memoryHook).toBe('Where it runs is the cloud model; who manages the stack is the service model.');
  });

  it('handles exam lens with only memory hook and no distractor marker', () => {
    const raw = `Tags describe resources and support organization and reporting. **Memory hook:** tags tell you what a resource is for; policy can require the rules.`;

    const result = splitExamLens(raw);

    expect(result.examLens).toBe('Tags describe resources and support organization and reporting.');
    expect(result.commonDistractor).toBeNull();
    expect(result.memoryHook).toBe('tags tell you what a resource is for; policy can require the rules.');
  });

  it('parses key terms cleanly without stray markdown asterisks', () => {
    const raw = `
- **Cloud computing:** Delivery of computing capabilities over a network.
- **Availability Zone**: Physically separate datacenter within an Azure region.
- Fault tolerance: Ability of a system to remain operational during component failure.
`;

    const terms = parseKeyTerms(raw);

    expect(terms).toHaveLength(3);
    expect(terms[0]).toEqual({
      term: 'Cloud computing',
      definition: 'Delivery of computing capabilities over a network.',
    });
    expect(terms[1]).toEqual({
      term: 'Availability Zone',
      definition: 'Physically separate datacenter within an Azure region.',
    });
    expect(terms[2]).toEqual({
      term: 'Fault tolerance',
      definition: 'Ability of a system to remain operational during component failure.',
    });
  });

  it('generates stable and normalized lesson slugs', () => {
    expect(generateSlug(2, 1, 4, 'Describe Azure physical infrastructure')).toBe('p2-m1-04-physical-infrastructure');
    expect(generateSlug(1, 1, 3, 'What is cloud computing')).toBe('p1-m1-03-cloud-computing');
    expect(generateSlug(3, 1, 2, 'Describe factors that can affect costs in Azure')).toBe('p3-m1-02-factors-that-can-affect-costs-in-azure');
  });

  it('sanitizes "Frixel" references into generic Nairobi startup examples', () => {
    const original = 'Frixel Labs might use a management group for all company subscriptions, a production subscription for customer-facing workloads, and separate resource groups for the API, observability, and storage resources.';

    const { text, rewrites } = handleFrixelRewrites(original);

    expect(text).not.toContain('Frixel');
    expect(text).toContain('Nairobi fintech startup');
    expect(rewrites).toHaveLength(1);
    expect(rewrites[0].oldText).toBe(original);
    expect(rewrites[0].newText).toBe(text);
  });
});

describe('Answer Key Pairing & Path Parsing Fixture', () => {
  it('pairs check-yourself questions with answer key answers for Path 1 format', () => {
    const akSection = `
## Unit 01 — Introduction
1. Ans 1A
2. Ans 1B

## Unit 02 — Cloud computing
1. Ans 2A
2. Ans 2B
`;

    const map = parseAnswerKey(1, akSection);
    expect(map.get(1)).toEqual(['Ans 1A', 'Ans 1B']);
    expect(map.get(2)).toEqual(['Ans 2A', 'Ans 2B']);
  });

  it('pairs check-yourself questions with answer key answers for Path 2 format (## NN. Title)', () => {
    const akSection = `
## 01. Introduction
1. Arch intro 1
2. Arch intro 2

## 02. What is Microsoft Azure
1. Azure def 1
2. Azure def 2
`;

    const map = parseAnswerKey(2, akSection);
    expect(map.get(1)).toEqual(['Arch intro 1', 'Arch intro 2']);
    expect(map.get(2)).toEqual(['Azure def 1', 'Azure def 2']);
  });

  it('pairs check-yourself questions with answer key answers for Path 3 format (## Module / **Unit**)', () => {
    const akSection = `
## Module 1 — Describe cost management in Azure

**Introduction**
1. Cost intro 1
2. Cost intro 2

**Factors that can affect costs**
1. Factors 1
2. Factors 2
`;

    const list = parseAnswerKey(3, akSection);
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual([
      ['Cost intro 1', 'Cost intro 2'],
      ['Factors 1', 'Factors 2'],
    ]);
  });

  it('correctly parses a mini markdown fixture, filtering skipped units and pairing kept units', () => {
    const fixture = `# AZ-900 Revision Library — Path 1: Describe cloud concepts

# Module 1 — Describe cloud computing

## 01. Introduction

**Source:** [Introduction](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/1-introduction)

**Summary:** Overview of cloud concepts.

**Key terms:**
- **Cloud:** Networked servers.

**Real example:** A Nairobi business considers the cloud.

**Exam lens:** This orientation page has little independent exam relevance. Memory hook: cloud basics.

**Check yourself:**
1. What is cloud?
2. Why use it?

## 02. What is cloud computing

**Source:** [What is cloud computing](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/2-what-is-cloud-computing)

**Summary:** Delivery of computing services over the internet.

**Key terms:**
- **Cloud computing:** On-demand computing services.
- **Elasticity:** Scaling resources dynamically.

**Real example:** A Nairobi retail startup deploys an online store.

**Exam lens:** The exam tests shared responsibility and delivery models. Distractor: confusing hosting with service models. Memory hook: rent, do not buy.

**Check yourself:**
1. Define cloud computing.
2. What is a key benefit?

# Answer key

## Unit 01 — Introduction
1. Cloud overview answer 1.
2. Cloud overview answer 2.

## Unit 02 — What is cloud computing
1. Delivery of computing services over the internet.
2. Flexibility and pay-as-you-go pricing.
`;

    const { units, reportData } = parsePath(1, fixture);

    expect(reportData.skipped).toHaveLength(1);
    expect(reportData.skipped[0].title).toBe('Introduction');

    expect(units).toHaveLength(1);
    const unit = units[0];
    expect(unit.title).toBe('What is cloud computing');
    expect(unit.slug).toBe('p1-m1-02-cloud-computing');
    expect(unit.position).toBe(1);
    expect(unit.exam_lens).toBe('The exam tests shared responsibility and delivery models.');
    expect(unit.common_distractor).toBe('confusing hosting with service models.');
    expect(unit.memory_hook).toBe('rent, do not buy.');
    expect(unit.check_yourself).toEqual([
      { q: 'Define cloud computing.', a: 'Delivery of computing services over the internet.' },
      { q: 'What is a key benefit?', a: 'Flexibility and pay-as-you-go pricing.' },
    ]);
  });
});
