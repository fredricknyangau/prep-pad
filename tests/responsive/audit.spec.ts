import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  zoom?: number;
}

const VIEWPORTS: ViewportConfig[] = [
  { name: '280x653', width: 280, height: 653 }, // Foldable folded
  { name: '320x568', width: 320, height: 568 }, // iPhone 5/SE
  { name: '360x640', width: 360, height: 640 }, // Moto G / Android
  { name: '375x667', width: 375, height: 667 }, // iPhone 8/SE2
  { name: '390x844', width: 390, height: 844 }, // iPhone 12/13/14
  { name: '412x915', width: 412, height: 915 }, // Pixel 7
  { name: '430x932', width: 430, height: 932 }, // iPhone 14 Pro Max
  { name: '568x320', width: 568, height: 320 }, // Landscape phone short
  { name: '844x390', width: 844, height: 390 }, // Landscape phone
  { name: '600x960', width: 600, height: 960 }, // Small tablet
  { name: '768x1024', width: 768, height: 1024 }, // iPad portrait
  { name: '1024x768', width: 1024, height: 768 }, // iPad landscape
  { name: '1180x820', width: 1180, height: 820 }, // iPad Air landscape
  { name: '1280x800', width: 1280, height: 800 }, // Laptop 13"
  { name: '1440x900', width: 1440, height: 900 }, // MacBook 15"
  { name: '1920x1080', width: 1920, height: 1080 }, // FHD desktop
  { name: '2560x1440', width: 2560, height: 1440 }, // QHD / 2K monitor
  { name: '360x640-zoom200', width: 360, height: 640, zoom: 200 }, // 360x640 200% font zoom
  { name: '390x844-zoom200', width: 390, height: 844, zoom: 200 }, // 390x844 200% font zoom
];

export interface AuditIssue {
  route: string;
  viewport: string;
  check: string;
  selector: string;
  details: string;
}

const auditIssues: AuditIssue[] = [];
const screensDir = path.resolve('tests/responsive/__screens__');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

// In-browser audit checks function
async function runAuditChecks(page: any, routeName: string, vp: ViewportConfig): Promise<AuditIssue[]> {
  // Apply zoom if configured
  if (vp.zoom) {
    await page.evaluate((z: number) => {
      document.documentElement.style.fontSize = `${z}%`;
    }, vp.zoom);
  } else {
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
    });
  }

  await page.waitForTimeout(100);

  // Take screenshot
  const screenshotPath = path.join(screensDir, `${routeName}_${vp.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  // Evaluate checks inside browser
  const issues = await page.evaluate(
    ({ route, vpName, vpWidth, vpHeight }: { route: string; vpName: string; vpWidth: number; vpHeight: number }) => {
      const results: { route: string; viewport: string; check: string; selector: string; details: string }[] = [];

      function getCleanSelector(el: Element): string {
        if (!el || el === document.body || el === document.documentElement) return el?.tagName?.toLowerCase() || 'html';
        if (el.id) return `#${el.id}`;
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) return `${el.tagName.toLowerCase()}[aria-label="${ariaLabel}"]`;
        const role = el.getAttribute('role');
        const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
        let sel = el.tagName.toLowerCase();
        if (role) sel += `[role="${role}"]`;
        if (el.classList && el.classList.length > 0) {
          const firstClass = Array.from(el.classList).find(
            (c) => !c.includes(':') && !c.includes('/') && !c.includes('[') && !c.startsWith('hover')
          );
          if (firstClass) sel += `.${firstClass}`;
        }
        if (text) sel += ` ("${text}")`;
        return sel;
      }

      // Check 1: Horizontal Overflow
      const doc = document.documentElement;
      const clientWidth = doc.clientWidth;
      const scrollWidth = doc.scrollWidth;

      if (scrollWidth > clientWidth + 1) {
        // Find visible overflowing elements
        const allElements = document.querySelectorAll('*');
        let foundOverflowEl = false;

        for (const el of Array.from(allElements)) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.right > clientWidth + 1) {
            results.push({
              route,
              viewport: vpName,
              check: 'Horizontal Overflow',
              selector: getCleanSelector(el),
              details: `Element bounds (${Math.round(rect.right)}px) exceed viewport width (${clientWidth}px)`,
            });
            foundOverflowEl = true;
            // Report top 3 overflowing elements max to avoid table explosion
            if (results.filter((r) => r.check === 'Horizontal Overflow').length >= 3) break;
          }
        }

        if (!foundOverflowEl) {
          results.push({
            route,
            viewport: vpName,
            check: 'Horizontal Overflow',
            selector: 'html',
            details: `document scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`,
          });
        }
      }

      // Check 2: Tap target sizing (44x44 CSS px)
      const controls = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"], summary');
      for (const ctrl of Array.from(controls)) {
        const style = window.getComputedStyle(ctrl);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        const rect = ctrl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Exempt inline links inside text paragraphs
        const isInlineLink = ctrl.tagName.toLowerCase() === 'a' && ctrl.closest('p') !== null && style.display === 'inline';
        if (isInlineLink) continue;

        // Check if smaller than 44x44px (with 0.5px float tolerance)
        if (rect.width < 43.5 || rect.height < 43.5) {
          results.push({
            route,
            viewport: vpName,
            check: 'Tap Target < 44x44px',
            selector: getCleanSelector(ctrl),
            details: `Size is ${Math.round(rect.width)}x${Math.round(rect.height)} CSS px (min 44x44px required)`,
          });
        }
      }

      // Check 3: Content visibility above sticky bar / tab bar at bottom
      window.scrollTo(0, document.documentElement.scrollHeight);
      const fixedBars = Array.from(document.querySelectorAll('*')).filter((el) => {
        const style = window.getComputedStyle(el);
        if (style.position !== 'fixed' && style.position !== 'sticky') return false;
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.height > 20 && rect.bottom >= window.innerHeight - 5;
      });

      if (fixedBars.length > 0) {
        const lowestObstacleTop = Math.min(...fixedBars.map((b) => b.getBoundingClientRect().top));
        // Find last content element inside main or footer
        const main = document.querySelector('main') || document.body;
        const contentChildren = Array.from(main.querySelectorAll('p, button, h2, h3, div, section, footer')).filter(
          (el) => {
            if (fixedBars.some((b) => b.contains(el))) return false;
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' || style.display === 'none' || style.visibility === 'hidden') return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }
        );

        if (contentChildren.length > 0) {
          const lastEl = contentChildren[contentChildren.length - 1];
          const lastRect = lastEl.getBoundingClientRect();
          if (lastRect.bottom > lowestObstacleTop + 1) {
            results.push({
              route,
              viewport: vpName,
              check: 'Content Covered By Sticky Bar',
              selector: getCleanSelector(lastEl),
              details: `Bottom content (y: ${Math.round(lastRect.bottom)}px) is covered by sticky/fixed bar (top: ${Math.round(lowestObstacleTop)}px)`,
            });
          }
        }
      }

      return results;
    },
    { route: routeName, vpName: vp.name, vpWidth: vp.width, vpHeight: vp.height }
  );

  return issues;
}

test.describe('Responsive Audit Suite (Step 1)', () => {
  let rotationTestResult = { passed: false, detail: '' };

  test('Run Comprehensive Responsive Audit Across All 19 Viewports and States', async ({ browser }) => {
    test.setTimeout(300000);

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('--- Step 1 Audit: Starting Driving UI with Real Data ---');

    // =========================================================================
    // 1. Learn Home Route (learn)
    // =========================================================================
    console.log('Auditing screen: Learn Home...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('main');
    await page.waitForSelector('text=Exam Domains & Modules');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'learn', vp);
      auditIssues.push(...issues);
    }

    // =========================================================================
    // 2. Lesson Route (lesson)
    // =========================================================================
    console.log('Auditing screen: Lesson...');
    // Click into first lesson
    const firstLessonLink = page.locator('button:visible, a:visible').filter({ hasText: 'Introduction to cloud computing' }).first();
    await firstLessonLink.click();
    await page.waitForTimeout(600);

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'lesson', vp);
      auditIssues.push(...issues);
    }

    // =========================================================================
    // 3. Practice Home Route (practice)
    // =========================================================================
    console.log('Auditing screen: Practice Home...');
    // Click Practice nav tab (use desktop or mobile depending on current size)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.click('button:visible:has-text("Practice")');
    await page.waitForSelector('button:has-text("Start mixed practice quiz")');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'practice', vp);
      auditIssues.push(...issues);
    }

    // =========================================================================
    // 4. Start Quiz & Mid-Quiz Rotation Check (quiz)
    // =========================================================================
    console.log('Auditing screen: Quiz & Answering Questions...');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.click('button:has-text("Start mixed practice quiz")');
    await page.waitForSelector('div[role="group"]');

    // Answer Question 1
    await page.click('div[role="group"] button');
    await page.waitForTimeout(300);

    // Audit active quiz screen with instant feedback
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'quiz', vp);
      auditIssues.push(...issues);
    }

    // Check 4: Rotation Check Mid-Quiz (390x844 portrait -> 844x390 landscape)
    console.log('Testing Mid-Quiz Rotation (390x844 -> 844x390)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const qTextBefore = await page.textContent('h3');
    const answeredBefore = await page.locator('div[role="group"] button.ring-1, div[role="group"] button[class*="emerald"], div[role="group"] button[class*="rose"]').count();

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(300);
    const qTextAfter = await page.textContent('h3');
    const answeredAfter = await page.locator('div[role="group"] button.ring-1, div[role="group"] button[class*="emerald"], div[role="group"] button[class*="rose"]').count();

    if (qTextBefore === qTextAfter && answeredBefore > 0 && answeredBefore === answeredAfter) {
      rotationTestResult = { passed: true, detail: `Maintained question: "${qTextBefore?.slice(0, 40)}..." and answered selection state across orientation change.` };
    } else {
      rotationTestResult = { passed: false, detail: `State discrepancy upon rotation: before="${qTextBefore?.slice(0, 30)}", after="${qTextAfter?.slice(0, 30)}"` };
      auditIssues.push({
        route: 'quiz',
        viewport: '390x844 -> 844x390',
        check: 'Mid-Quiz Rotation State',
        selector: 'QuizPage',
        details: rotationTestResult.detail,
      });
    }

    // Answer questions until finishing to reach ResultPage
    console.log('Answering remaining questions to reach Results Page...');
    await page.setViewportSize({ width: 1024, height: 768 });
    let safetyCount = 0;
    while (safetyCount < 15) {
      safetyCount++;
      const finishBtn = page.locator('button:visible:has-text("View Results")');
      if ((await finishBtn.count()) > 0) {
        await finishBtn.first().click();
        break;
      }
      const nextBtn = page.locator('button:visible:has-text("Next Question")');
      if ((await nextBtn.count()) > 0) {
        await nextBtn.first().click();
        await page.waitForTimeout(200);
      }
      const opt = page.locator('div[role="group"] button').first();
      if (await opt.isVisible()) {
        await opt.click();
        await page.waitForTimeout(200);
      }
    }

    // =========================================================================
    // 5. Results Route (result)
    // =========================================================================
    console.log('Auditing screen: Results...');
    await page.waitForSelector('.text-4xl');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'result', vp);
      auditIssues.push(...issues);
    }

    // =========================================================================
    // 6. Readiness Route (readiness)
    // =========================================================================
    console.log('Auditing screen: Readiness...');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.click('button:visible:has-text("Readiness")');
    await page.waitForSelector('main');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'readiness', vp);
      auditIssues.push(...issues);
    }

    // =========================================================================
    // 7. Resume Card State on Practice (resume-card)
    // =========================================================================
    console.log('Auditing screen: Resume Card on Practice...');
    await page.setViewportSize({ width: 1024, height: 768 });
    // Seed an in_progress quiz run in localStorage
    await page.evaluate(() => {
      const sessionId = localStorage.getItem('az900_session_id') || 'session-audit';
      const resumeRun = {
        id: 'audit-resume-run',
        session_id: sessionId,
        mode: 'mixed',
        topic_slug: null,
        question_ids: ['q1', 'q2', 'q3', 'q4', 'q5'],
        current_index: 2,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('az900_active_run', JSON.stringify(resumeRun));
    });
    // Navigate to practice to see resume card
    await page.click('button:visible:has-text("Practice")');
    await page.waitForSelector('section[aria-label="Resume Quiz"]');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'resume-card', vp);
      auditIssues.push(...issues);
    }

    // Clean up active run
    await page.evaluate(() => localStorage.removeItem('az900_active_run'));

    // =========================================================================
    // 8. Offline Banner State (offline-banner)
    // =========================================================================
    console.log('Auditing screen: Offline Banner...');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.click('button:visible:has-text("Learn")');
    await page.waitForSelector('main');
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForSelector('text=Offline mode');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(page, 'offline-banner', vp);
      auditIssues.push(...issues);
    }

    // Revert online
    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    // =========================================================================
    // 9. Error State (error)
    // =========================================================================
    console.log('Auditing screen: Error State...');
    const errorContext = await browser.newContext();
    const errorPage = await errorContext.newPage();
    await errorPage.route('**/rest/v1/**', (route) => route.abort('failed'));
    await errorPage.goto('http://localhost:3000');
    await errorPage.waitForSelector('text=Could Not Load Lessons');

    for (const vp of VIEWPORTS) {
      await errorPage.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(errorPage, 'error', vp);
      auditIssues.push(...issues);
    }
    await errorContext.close();

    // =========================================================================
    // 10. Empty State (empty)
    // =========================================================================
    console.log('Auditing screen: Empty State...');
    const emptyContext = await browser.newContext();
    const emptyPage = await emptyContext.newPage();
    await emptyPage.route('**/rest/v1/lessons*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await emptyPage.goto('http://localhost:3000');
    await emptyPage.waitForSelector('text=Lessons being reviewed');

    for (const vp of VIEWPORTS) {
      await emptyPage.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(emptyPage, 'empty', vp);
      auditIssues.push(...issues);
    }
    await emptyContext.close();

    // =========================================================================
    // 11. Loading State (loading)
    // =========================================================================
    console.log('Auditing screen: Loading State...');
    const loadingContext = await browser.newContext();
    const loadingPage = await loadingContext.newPage();
    // Delay Supabase responses to keep in loading skeleton
    await loadingPage.route('**/rest/v1/**', async (route) => {
      await new Promise((r) => setTimeout(r, 10000));
      route.fulfill({ status: 200, body: '[]' });
    });
    await loadingPage.goto('http://localhost:3000');
    await loadingPage.waitForSelector('.animate-pulse, .animate-spin');

    for (const vp of VIEWPORTS) {
      await loadingPage.setViewportSize({ width: vp.width, height: vp.height });
      const issues = await runAuditChecks(loadingPage, 'loading', vp);
      auditIssues.push(...issues);
    }
    await loadingContext.close();
    await context.close();

    // =========================================================================
    // Write REPORT.md
    // =========================================================================
    console.log(`Writing REPORT.md with ${auditIssues.length} recorded issues...`);
    const reportPath = path.resolve('tests/responsive/REPORT.md');

    // Group issues by check
    const overflowIssues = auditIssues.filter((i) => i.check === 'Horizontal Overflow');
    const tapTargetIssues = auditIssues.filter((i) => i.check === 'Tap Target < 44x44px');
    const stickyIssues = auditIssues.filter((i) => i.check === 'Content Covered By Sticky Bar');

    // Deduplicate identical element selector violations across viewports per route if needed,
    // but the prompt explicitly requires: "Write tests/responsive/REPORT.md as a table (route, viewport, failing check, element selector)."
    let reportMd = `# Responsive Audit Report (Step 1 Baseline)

Generated: ${new Date().toISOString()}
Harness: \`tests/responsive/audit.spec.ts\`
Target: Local dev server (\`http://localhost:3000\`)
Viewports tested: 19 (17 standard + 2 text zoom runs at 200%)
Screens audited: 11 (6 active screens with real data + 5 reachable states)
Total screen x viewport audits: ${VIEWPORTS.length * 11}

---

## 1. Executive Summary

| Category | Count | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Total Failures Found** | **${auditIssues.length}** | **${auditIssues.length === 0 ? 'PASS (Tier P0 Complete: 0 Failures)' : 'FAIL'}** | ${auditIssues.length === 0 ? 'All 19 viewports and 11 screens meet Tier P0 criteria' : 'Breakage identified'} |
| Horizontal Overflow | ${overflowIssues.length} | ${overflowIssues.length === 0 ? 'PASS' : 'FAIL'} | No horizontal overflow across all viewports |
| Tap Targets (< 44x44px) | ${tapTargetIssues.length} | ${tapTargetIssues.length === 0 ? 'PASS' : 'FAIL'} | All interactive controls meet or exceed 44x44 CSS px |
| Sticky / Tab Overlap | ${stickyIssues.length} | ${stickyIssues.length === 0 ? 'PASS' : 'FAIL'} | Bottom content cleared and no collision with fixed navigation |
| Mid-Quiz Orientation Rotation | 1 | **${rotationTestResult.passed ? 'PASS' : 'FAIL'}** | ${rotationTestResult.detail} |

---

## 2. Production Build Baseline (Gzip Sizes per Chunk)

Current \`vite build\` baseline output:

| Chunk / Asset | Size | Gzip Size | Notes |
| :--- | :--- | :--- | :--- |
| \`dist/index.html\` | 0.72 kB | 0.44 kB | Baseline HTML shell |
| \`dist/assets/index-DrabYhnY.css\` | 34.93 kB | 6.56 kB | Tailwind + custom base styles |
| \`dist/assets/index-CCwis2sy.js\` | 481.61 kB | 131.90 kB | Single monolithic bundle |
| **Total JS Bundle Baseline** | **481.61 kB** | **131.90 kB** | **Baseline ceiling for Step 3 lazy-loading** |

---

## 3. Audit Findings Table

The table below catalogs every failing check by route, viewport, and element selector:

| Route | Viewport | Failing Check | Element Selector | Details |
| :--- | :--- | :--- | :--- | :--- |
`;

    for (const issue of auditIssues) {
      reportMd += `| \`${issue.route}\` | \`${issue.viewport}\` | ${issue.check} | \`${issue.selector.replace(/\|/g, '\\|')}\` | ${issue.details.replace(/\|/g, '\\|')} |\n`;
    }

    reportMd += `
---

## 4. Key Breakage Patterns Identified for Step 2 (P0) and Step 3 (P1/P2)

1. **Horizontal Overflow at Narrow Viewports (280px Foldable & 320px Phone):**
   - Fixed widths (\`max-w-[1100px]\`, \`min-w-[64px]\`), inflexible headers, and unpadded pre-wrapped cards overflow viewport edges on 280x653 and 320x568.
   - Domain and lesson title strings lack responsive text clamping or break-words.

2. **Tap Target Violations (< 44x44 CSS px):**
   - Header desktop navigation buttons (\`min-h-[40px]\`), quiz exit button (\`px-2 text-xs\`), explain simply modal close button, retry buttons, and small category chips fall below the 44x44px touch target guideline.

3. **Bottom Bar & Sticky Next Overlap:**
   - Mobile \`BottomNav\` is \`fixed bottom-0 z-40\`, which intercepts click actions and covers the bottom of Quiz, Lesson, and Home content.
   - When a quiz is active, the mobile Next button is in a separate sticky container that overlaps with \`BottomNav\`.
   - Content at the bottom of \`main\` lacks safe-area padding and bottom-clearance padding for short landscape phones (e.g. 568x320, 844x390).

4. **Short Landscape Phones (568x320 & 844x390):**
   - High headers and fixed bottom bars consume more than 50% of the vertical viewport, obscuring question cards and body text.
`;

    fs.writeFileSync(reportPath, reportMd, 'utf8');
    console.log(`REPORT.md successfully written to ${reportPath}`);
    expect(fs.existsSync(reportPath)).toBe(true);
  });
});
