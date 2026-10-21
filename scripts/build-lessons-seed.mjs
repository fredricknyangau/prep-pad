#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const PATH_CONFIG = {
  1: {
    domainTitle: 'Describe cloud concepts',
    jsonFile: 'content/lessons/path1.json',
    seedFile: 'supabase/seed/lessons_path1.sql',
  },
  2: {
    domainTitle: 'Describe Azure architecture and services',
    jsonFile: 'content/lessons/path2.json',
    seedFile: 'supabase/seed/lessons_path2.sql',
  },
  3: {
    domainTitle: 'Describe Azure management and governance',
    jsonFile: 'content/lessons/path3.json',
    seedFile: 'supabase/seed/lessons_path3.sql',
  },
};

function escapeDollar(str, tag = 'lsn') {
  if (str === null || str === undefined) return 'null';
  const tagOpen = `$${tag}$`;
  const tagClose = `$${tag}$`;
  if (str.includes(tagOpen)) {
    throw new Error(`String contains raw delimiter ${tagOpen}: "${str.slice(0, 50)}..."`);
  }
  return `${tagOpen}${str}${tagClose}`;
}

export function buildSeedForPath(pathNum) {
  const config = PATH_CONFIG[pathNum];
  const jsonPath = path.resolve(ROOT_DIR, config.jsonFile);

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON file not found: ${config.jsonFile}. Run scripts/parse-notes.mjs first.`);
  }

  const lessons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  let sql = `-- =============================================================================\n`;
  sql += `-- lessons_path${pathNum}.sql\n`;
  sql += `-- AZ-900 Prep Coach — Seed for Path ${pathNum}: ${config.domainTitle}\n`;
  sql += `-- Total lessons: ${lessons.length}\n`;
  sql += `-- Idempotent insert with ON CONFLICT (slug) DO UPDATE.\n`;
  sql += `-- reviewed_by_human is preserved and NOT touched on update.\n`;
  sql += `-- =============================================================================\n\n`;

  for (const l of lessons) {
    const slugSql = escapeDollar(l.slug);
    const domainTitleSql = escapeDollar(l.domain_title);
    const modTitleSql = escapeDollar(l.module_title);
    const titleSql = escapeDollar(l.title);
    const summarySql = escapeDollar(l.summary);
    const keyTermsSql = `${escapeDollar(JSON.stringify(l.key_terms))}::jsonb`;
    const realExampleSql = escapeDollar(l.real_example);
    const examLensSql = escapeDollar(l.exam_lens);
    const commonDistractorSql = l.common_distractor ? escapeDollar(l.common_distractor) : 'null';
    const memoryHookSql = escapeDollar(l.memory_hook);
    const checkYourselfSql = `${escapeDollar(JSON.stringify(l.check_yourself))}::jsonb`;
    const sourceUrlSql = escapeDollar(l.source_url);
    const verifyNoteSql = l.verify_note ? escapeDollar(l.verify_note) : 'null';

    sql += `insert into public.lessons (\n`;
    sql += `    slug,\n`;
    sql += `    topic_id,\n`;
    sql += `    position,\n`;
    sql += `    title,\n`;
    sql += `    summary,\n`;
    sql += `    key_terms,\n`;
    sql += `    real_example,\n`;
    sql += `    exam_lens,\n`;
    sql += `    common_distractor,\n`;
    sql += `    memory_hook,\n`;
    sql += `    check_yourself,\n`;
    sql += `    source_url,\n`;
    sql += `    est_read_minutes,\n`;
    sql += `    needs_verification,\n`;
    sql += `    verify_note,\n`;
    sql += `    reviewed_by_human\n`;
    sql += `)\n`;
    sql += `values (\n`;
    sql += `    ${slugSql},\n`;
    sql += `    (\n`;
    sql += `        select m.id\n`;
    sql += `        from public.topics m\n`;
    sql += `        join public.topics d on m.parent_id = d.id\n`;
    sql += `        where d.title = ${domainTitleSql}\n`;
    sql += `          and m.title = ${modTitleSql}\n`;
    sql += `    ),\n`;
    sql += `    ${l.position},\n`;
    sql += `    ${titleSql},\n`;
    sql += `    ${summarySql},\n`;
    sql += `    ${keyTermsSql},\n`;
    sql += `    ${realExampleSql},\n`;
    sql += `    ${examLensSql},\n`;
    sql += `    ${commonDistractorSql},\n`;
    sql += `    ${memoryHookSql},\n`;
    sql += `    ${checkYourselfSql},\n`;
    sql += `    ${sourceUrlSql},\n`;
    sql += `    ${l.est_read_minutes},\n`;
    sql += `    ${l.needs_verification},\n`;
    sql += `    ${verifyNoteSql},\n`;
    sql += `    false\n`;
    sql += `)\n`;
    sql += `on conflict (slug) do update set\n`;
    sql += `    topic_id = excluded.topic_id,\n`;
    sql += `    position = excluded.position,\n`;
    sql += `    title = excluded.title,\n`;
    sql += `    summary = excluded.summary,\n`;
    sql += `    key_terms = excluded.key_terms,\n`;
    sql += `    real_example = excluded.real_example,\n`;
    sql += `    exam_lens = excluded.exam_lens,\n`;
    sql += `    common_distractor = excluded.common_distractor,\n`;
    sql += `    memory_hook = excluded.memory_hook,\n`;
    sql += `    check_yourself = excluded.check_yourself,\n`;
    sql += `    source_url = excluded.source_url,\n`;
    sql += `    est_read_minutes = excluded.est_read_minutes,\n`;
    sql += `    needs_verification = excluded.needs_verification,\n`;
    sql += `    verify_note = excluded.verify_note;\n\n`;
  }

  // Link any matching questions
  sql += `-- Backfill questions.lesson_id for Path ${pathNum}\n`;
  sql += `update public.questions q\n`;
  sql += `set lesson_id = l.id\n`;
  sql += `from public.lessons l\n`;
  sql += `where q.skill_ref = l.source_url\n`;
  sql += `  and q.lesson_id is distinct from l.id;\n`;

  return sql;
}

export function main() {
  const seedDir = path.resolve(ROOT_DIR, 'supabase/seed');
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
  }

  for (const p of [1, 2, 3]) {
    const config = PATH_CONFIG[p];
    const sql = buildSeedForPath(p);
    const outPath = path.resolve(ROOT_DIR, config.seedFile);
    fs.writeFileSync(outPath, sql, 'utf8');
    console.log(`Generated SQL seed: ${config.seedFile}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main();
}
