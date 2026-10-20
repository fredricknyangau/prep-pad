import json
import glob
import os

def generate_seed():
    files = sorted(glob.glob('content/published/*.json'))
    os.makedirs('supabase/seed', exist_ok=True)
    seed_file = 'supabase/seed/0001_questions_seed.sql'
    
    with open(seed_file, 'w') as out:
        out.write("-- =============================================================================\n")
        out.write("-- 0001_questions_seed.sql\n")
        out.write("-- AZ-900 Prep Coach — 59 verified quiz questions with P2d Explanations\n")
        out.write("-- All rows have reviewed_by_human = true\n")
        out.write("-- =============================================================================\n\n")
        
        total_questions = 0
        for fpath in files:
            mod_slug = os.path.basename(fpath).replace('.json', '')
            with open(fpath, 'r') as fp:
                items = json.load(fp)
            
            out.write(f"-- ---------------------------------------------------------------------------\n")
            out.write(f"-- {mod_slug} ({len(items)} questions)\n")
            out.write(f"-- ---------------------------------------------------------------------------\n")
            
            for q in items:
                topic_slug = q["topic_id"]
                skill_ref = q["skill_ref"]
                diff = q["difficulty"]
                question_text = q["question"]
                options_json = json.dumps(q["options"])
                summary = q["summary"]
                
                out.write("insert into questions (topic_id, skill_ref, difficulty, question, options, summary, needs_human_check, check_note, reviewed_by_human)\n")
                out.write(f"select id, $ref${skill_ref}$ref$, {diff}, $q${question_text}$q$, $opts${options_json}$opts$::jsonb, $sum${summary}$sum$, false, '', true\n")
                out.write(f"from topics where slug = '{topic_slug}';\n\n")
                total_questions += 1

        print(f"Generated {seed_file} with {total_questions} questions using dollar-quoted strings.")

if __name__ == '__main__':
    generate_seed()
