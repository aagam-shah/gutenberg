# Step 4: Report Findings

Summarize reproduction findings in a GitHub-comment-friendly format.

## 4.1 Load data files

Read the findings file:

```bash
cat /tmp/triage/<issue>/<issue>.findings.json
```

Optionally read parsed issue for context:

```bash
cat /tmp/triage/<issue>/<issue>.parsed.json
```

## 4.2 Extract key information

From `findings.json`:

- `result`: "reproduced" | "not_reproduced" | "inconclusive"
- `environment`: WordPress, Gutenberg, PHP versions tested
- `steps_executed`: Array of executed steps with success/failure status
- `evidence`: Console errors, screenshots, observations
- `limitations`: Any constraints or issues encountered

From `parsed.json` (if available):

- `issue.title`: Bug title for context
- `issue.url`: Link to original issue
- `reproduction.expected`: Expected behavior
- `reproduction.actual`: Reported actual behavior
- `labels`: Issue labels (e.g., `[Feature] Global Styles`, `[Block] Navigation`)

## 4.3 Format GitHub comment

Load the comment template:

```bash
cat .claude/templates/triage-comment.md
```

Replace Mustache placeholders with values from `findings.json` and `parsed.json`:

- `{{result}}`: Map `findings.json.result` to emoji (used in the main heading):
  - `"reproduced"` → `✅ Reproduced`
  - `"not_reproduced"` → `❌ Not Reproduced`
  - `"inconclusive"` → `⚠️ Inconclusive`
  - The heading will be: `## Triage Results: {{result}}`

- `{{environment}}`: Format from `findings.json.environment`:
  - `WP {wordpress}, Gutenberg {gutenberg}, PHP {php}`
  - Example: `WP latest, Gutenberg latest, PHP 8.2`

- `{{summary}}`: 1-2 sentence summary of what was tested and the result
  - Describe the bug confirmation or lack thereof
  - Example: "Bug confirmed: Accordion block (Details) headings do not appear in the Document Outline tab, while regular heading blocks display correctly."

- `{{test_setup}}`: Format from `findings.json.steps_executed` and blueprint information:
  - List key setup steps or configuration used (e.g., "Created test post with Details block", "Configured theme settings")
  - Can include blueprint customizations if relevant
  - Keep concise - focus on what's relevant to understanding the reproduction
  - If no special setup needed, use empty string (blank line is acceptable)

- `{{screenshots_placeholder}}`: Leave as `{{screenshots_placeholder}}` when posting the comment
  - **Note:** The GitHub Actions workflow will automatically replace this placeholder with the actual artifact URL after screenshots are uploaded. The template already includes the markdown structure (heading and link text); only the URL needs to be replaced.
  - **Important:** The Screenshots section will always appear in the comment, even if no screenshots were captured (the placeholder will remain until replaced by GitHub Actions)

- `{{network_errors}}`: Format from `findings.json.evidence.network_errors`:
  - Format as: `**Network:** \`{method} {endpoint}\` → {status}` (one per line, only failed requests)
  - If no network errors, use empty string
  - Example: `**Network:** \`POST /wp-json/wp/v2/posts\` → 500`

- `{{console_errors}}`: Format from `findings.json.evidence.console_errors`:
  - Format as: `**Console:** {error message}` (top 5 most relevant errors)
  - If no console errors, use empty string
  - Example: `**Console:** Uncaught TypeError: Cannot read property 'x' of undefined`

- `{{observations}}`: Format from `findings.json.evidence.observations`:
  - Any other relevant observations or notes
  - If no observations, use empty string
  - Can be plain text or formatted as needed

**Handling empty sections:**

- **Evidence section**: If all three evidence placeholders (`{{network_errors}}`, `{{console_errors}}`, `{{observations}}`) are empty, you may either:
  - Leave the "### Evidence" heading with blank content (acceptable)
  - Or omit the entire Evidence section from the final comment (remove the heading and all placeholders)

- **Test setup**: If `{{test_setup}}` is empty, a blank line is acceptable - the Reproduction Workflow section will still show Environment.

- **Blank lines**: Extra blank lines from empty placeholders are acceptable and won't break the comment format.

- `{{affected_code}}`: Format as bullet list (the "Likely affected code" heading is already in the template):
  - `- \`{file/path}\` - {reason}`
  - One line per file, with brief explanation
  - See section 4.4 for how to identify suspect code

- `{{suggested_fix}}`: 1-2 sentences on what needs to change (the "Suggested fix" heading is already in the template)
  - Brief suggestion based on code analysis
  - Example: "Extend computeOutlineHeadings to include Details blocks (core/details) by extracting their summary attribute, or add a filter mechanism allowing blocks to opt-in to the outline feature."

**Template substitution:** Use `sed` or similar to replace placeholders:

```bash
TEMPLATE=$(cat .claude/templates/triage-comment.md)
COMMENT=$(echo "$TEMPLATE" | sed "s/{{result}}/$RESULT/g" | sed "s/{{environment}}/$ENVIRONMENT/g" ...)
```

Or build the comment by reading the template and replacing each placeholder with the appropriate value.

## 4.4 Suspect Code Areas

When bug is reproduced, identify suspect code using:

1. **Label-based search**: Extract feature/block names from labels

   - `[Feature] Global Styles` → Search "Global Styles", "theme.json", "custom CSS"
   - `[Block] Navigation` → Search "Navigation block", "block navigation"

2. **Step-based search**: Analyze reproduction steps

   - "Save" actions → Search save functions, API endpoints
   - "Additional CSS" → Search CSS-related code
   - UI interactions → Search component files

3. **Error-based search**: Use error messages

   - Extract error text → Search codebase for error strings
   - HTTP status codes → Search API error handling

4. **File path patterns**: Based on Gutenberg structure
   - Site Editor: `packages/edit-site/src/**`
   - Blocks: `packages/block-library/src/**/<block-name>/**`
   - Components: `packages/components/src/**`
   - Core Data: `packages/core-data/src/**`

Format code references as:

- File paths relative to Gutenberg repo root
- Brief explanation of why the file is relevant

## Formatting Guidelines

### Keep it concise

- Total length: 15-25 lines maximum
- One summary sentence, not paragraphs
- Bullet points, not prose
- Only essential evidence in collapsible section

### Focus on action

- What's broken (1 sentence)
- Where to look (file paths)
- What to fix (brief suggestion)

### Skip if not helpful

- **Evidence section**: If all evidence placeholders are empty, you may omit the entire "### Evidence" section (heading and all placeholders)
- Skip console errors if unrelated to the bug
- Skip network errors if unrelated to the bug
- Skip observations if not relevant
- Don't include limitations unless critical to understanding the reproduction
- No "Next Steps" or "Impact Assessment" sections
- **Note**: Blank lines from empty placeholders are acceptable and won't break the comment format

## 4.5 Output to console

Print the formatted markdown to console. Keep the output concise - aim for 50-100 lines maximum for GitHub comment readability.

## 4.6 Post GitHub comment

After generating the findings and substituting template placeholders (from section 4.3), post the comment to the GitHub issue:

```bash
gh issue comment <issue_number> --repo aagam-shah/gutenberg --body "$(cat <<'EOF'
<template-substituted markdown comment>
EOF
)"
```

**Important:**
- Use the template from `.claude/templates/triage-comment.md` with all placeholders replaced
- The comment will be posted under the authenticated user's account
- Confirm successful posting by checking the command output

**Output after posting:**

```
COMMENT POSTED: https://github.com/aagam-shah/gutenberg/issues/<issue>#issuecomment-<id>
```
