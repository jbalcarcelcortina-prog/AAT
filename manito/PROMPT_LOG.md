# Prompt log — AAT A2

Ordered notes of the instructions for this assignment and what changed
after them. Newest entry is at the bottom.

## 1. Suggest the oficio from the problem text

Instructions I was working from:

- Start from the public repo `https://github.com/jbalcarcelcortina-prog/AAT`,
  branch `main`, app in `manito/`. Keep that history and the original
  commit authors. Do not push to that GitHub repo.
- When a customer posts a problem, suggest the trade (oficio) from keywords
  in the description. The text is Spanish, Mexico.
- Acceptance check: "se fue la luz en la cocina y huele a quemado" must
  suggest Electricista.
- Cover the trades the app already has. Handle accents and case. If nothing
  matches, return no suggestion or a low-confidence result.
- A keyword classifier as a library module, reusing existing patterns where
  that makes sense.
- A testable endpoint, `POST /api/suggest-trade`, body `{ description }`,
  response with the suggested trade and the matched keywords.
- Show the suggestion on the post-a-problem screen (prefill or suggest).
  The person can still change the trade. Spanish, using the existing UI
  strings.
- Unit tests for the acceptance example, a few other trades, and a no-match
  case. `next build` and the tests have to pass.
- Small commits whose messages say what was actually decided.
- This file: an honest log of the prompts and what was done, in order.
- If something off-spec would be nicer, do not build it. List it so Joaquin
  can accept or reject it.

What I did:

1. Fetched AAT `main`. New commits sit on top of
   `6b74c332d88edee718030b5fee686bd8ae75220f` ("Document Vercel Root
   Directory and first production deploy"). The three earlier commits and
   their author are unchanged.

2. The trades already in `src/lib/constants.ts` are plumbing, electrical,
   HVAC, handyman, and appliance repair. I added a Spanish oficio on each
   row and left the English labels as they were, so the rest of the screens
   stay in English:
   - Plomero
   - Electricista
   - Técnico en aire acondicionado
   - Manitas
   - Técnico en electrodomésticos

3. `src/lib/suggest-trade.ts` follows the matcher file: a pure function,
   the weights in one place, and a short comment on what it will not do.
   It lowercases, strips accents, and only counts a keyword as a whole
   word, so "luz" does not match inside "reluciente". High confidence
   needs a score of at least 4 and a lead of at least 2 over the next
   trade. Below that the result is low confidence. No keyword means
   `confidence: "none"` and a null oficio. A tie stays low and breaks
   toward whichever trade is listed first in `SERVICE_CATEGORIES`
   (plumbing before electrical). I left out "llave" on purpose, because
   in Spanish it is both a faucet and a key.

4. Tests are `src/lib/suggest-trade.test.ts`, run with `node:test` through
   `npm test`. I did not add Vitest or Jest. Node does not read the `@/`
   path from tsconfig, so `test/register-alias.mjs` resolves it. The
   acceptance sentence returns Electricista, high confidence, keywords
   `luz` and `quemado`. The file also covers the other four oficios,
   accents and case, a weak "agua" (low, Plomero), a fuga/enchufe tie
   (low), a no-match mudanza sentence, and a word-boundary miss.

5. `POST /api/suggest-trade` uses the same `{ data }` / `{ error, fields }`
   helpers as the other routes. It is public, same idea as
   `GET /api/providers`: the answer is only a function of the text, so
   curl can hit it without a session. Empty text is allowed and returns
   no suggestion. A non-string description is a 400.

6. The post-a-problem form waits 400ms after the description reaches 10
   characters, then calls that endpoint. High confidence fills the trade
   select until the customer opens it and picks something else. Low
   confidence does not fill the select; it shows the guess and a
   "Usar …" button. Deleting the description clears a guess the form
   filled in, and leaves a trade the customer picked. The sentences are
   in `src/lib/strings.ts`:
   - "Sugerimos Electricista por lo que escribiste."
   - "Tal vez sea Plomero, pero no es seguro."
   - "Puedes cambiar el oficio si no es el correcto."

7. `npm test`: 12 passing. `npm run build`: success. The new route shows
   up as `ƒ /api/suggest-trade`.

Commits, on top of the imported `main`:

- `d4fc67c` Score description keywords to suggest an oficio
- `6651bb5` Expose the classifier as POST /api/suggest-trade
- `5c41c6a` Show the suggested oficio while posting a problem

This file is committed after those three.
