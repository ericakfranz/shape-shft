# Persona walkthroughs

**What these are:** design reviews. Each fictional persona's situation was traced through the ShapeShft instructions (the combined AI instructions, START HERE and the tools) to check whether the instructions tell the AI and the user what to do. **These are not live AI tests.** They do not show how any particular AI model behaves. Live testing with real AI assistants is listed as outstanding in the implementation report.

Every persona is fictional.

| # | Persona | Situation |
|---|---|---|
| 1 | Morgan (full example in `examples/morgan-ellery`) | 14 years at one distribution center, laid off when it closed |
| 2 | Denise, 58 | Bookkeeper for one family-owned company for 22 years; has not interviewed in over ten years |
| 3 | Priyanka, 41 | Remote data entry and quality reviewer for 9 years; rarely talks about her work out loud |
| 4 | Andre, 34 | Restaurant kitchen manager changing careers to logistics coordinator |
| 5 | Kai, 22 | Little formal employment: part-time retail, family landscaping business, community college |
| 6 | Rosa, 47 | Returning to work after eight years of caregiving; was a dental office front desk coordinator |
| 7 | Teresa (full example in `examples/teresa-halvorsen`) | HVAC technician, trade profession |
| 8 | Marcus, 39 | Nurse seeking a charge nurse (leadership) promotion |

## What was checked for each persona

1. Can they get a first useful result without a full career history or existing documents?
2. Do the instructions adapt questions to their profession, without assuming technology jobs or metrics?
3. Does fact handling protect them (no invented experience, estimates labeled)?
4. Does the Conversation Coach meet them at their level and keep them speaking out loud?
5. Is there a path for their specific difficulty?

## Results

### 1. Morgan: decades in one industry, laid off

- First result: Career Discovery's "minimum profile" (two or three roles, two confirmed stories, direction and essentials) is reachable in one session. Pass.
- Difficulty, explaining the layoff: interview-prep "Talking about hard topics" plus the example guide's short, calm explanation. Pass.
- Numbers: Morgan could not explain the 40%. Constructive challenge example and Day 3 of the 7-day guide address exactly this. Pass.

### 2. Denise: has not interviewed in over ten years

- Coach purpose section names this situation. Guided level is the default. Recovery skills and "If you get stuck" appear in every guide. Pass.
- Accomplishments without corporate metrics: Discovery Stage C questions ("What problems did you prevent?", "What would have been harder if you had not been there?") fit bookkeeping. Pass.

### 3. Priyanka: remote, little spoken practice

- Speaking out loud is the central rule, repeated in sessions, guides and START HERE. Alternatives exist if speaking aloud at home is awkward (whispering, a trusted person, unedited typing). Pass.
- Walk-and-talk is optional, with an indoor alternative. Pass.

### 4. Andre: career changer

- Discovery Stage E (transferable experience) and the Resume Builder's "supported by transferable experience" category. Pass.
- Unprepared conversation practice is recommended for career changers, with the rule to separate "what I would do" from "what I have done". Pass.
- **Gap found and fixed:** the headline rule ("put the posting's exact title in the headline") could make a career changer appear to claim a title. The Resume Builder skill now says when a skills-based headline is the honest choice.

### 5. Kai: little formal employment

- Discovery says unpaid, informal, family business and volunteer work all count, and works with no documents. Pass.
- **Gap found and fixed:** the Workbench has no separate section for family business, volunteer or project work, and the skill did not say where such work goes. The Resume Builder skill now says to add it to `exp` as an honest role, never presented as paid employment. The Workbench help page also explains this.
- Education section: supported through the new optional `edu` key. Pass.

### 6. Rosa: returning after caregiving

- **Gap found and fixed:** no guidance on employment gaps. The Resume Builder skill now says not to hide or invent anything, that a resume does not have to explain a gap, that caregiving can be an honest role if the user wants, and to prepare an explanation in the Conversation Coach. Interview-prep already covered "a gap".
- Older experience (eight years ago) is still valid evidence; the Career Profile keeps it. Pass.

### 7. Teresa: trade profession

- Licenses and certifications go in `certs`. A current role uses `Present`, and present-tense bullets do not trigger the past-tense warning (covered by an automated test). Pass.
- Example built and validated without any technology-industry assumptions. Pass.

### 8. Marcus: leadership promotion

- Coach supports "an internal promotion" and "a performance review" as practice contexts when not job searching. Pass.
- Interview prep by stage and person works for an internal panel. Questions to ask focus on authority, workload and role clarity. Pass.
- Privacy: the core rules tell the AI to help describe confidential details (here, patient information) at a general level. Pass.

## Not covered by these walkthroughs

- How well a specific AI model follows the instructions, writes valid JSON, or avoids inventing facts. This needs live testing.
- Users with screen readers, low vision or motor disabilities using the tools. The tools use semantic HTML, labels and large targets, but no assistive-technology testing was done.
- Non-US resume conventions (the Workbench prints US Letter, with no photo or date of birth fields).
