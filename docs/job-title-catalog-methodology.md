# Job Title Catalog Methodology

PivotIQ's job title catalog is built from the official O*NET database, not from hand-curated heuristics.

Source files:
- `Occupation Data.txt` from O*NET 30.2
- `Alternate Titles.txt` from O*NET 30.2

White-collar filter:
- Management (`11`)
- Business and Financial Operations (`13`)
- Computer and Mathematical (`15`)
- Architecture and Engineering (`17`)
- Life, Physical, and Social Science (`19`)
- Community and Social Service (`21`)
- Legal (`23`)
- Educational Instruction and Library (`25`)
- Arts, Design, Entertainment, Sports, and Media (`27`)
- Healthcare Practitioners and Technical (`29`)
- Sales and Related (`41`)
- Office and Administrative Support (`43`)

Build flow:
1. Download the official O*NET text files.
2. Keep only occupations in the white-collar major groups above.
3. Add canonical occupation titles from `Occupation Data.txt`.
4. Add alternate job titles from `Alternate Titles.txt`.
5. Deduplicate by normalized title.
6. Preserve the canonical title, O*NET-SOC code, and major group for search and analytics.

Commands:
- `npm run db:build-job-titles`
- `npm run db:seed-job-titles`
