# Test Questions

## 1) What would you not automate in this flow, and why?

In this flow, I wouldn't automate anything involving third-party or private data, PDF downloads, or payment getaways, just to avoid exposing sensitive info. I'd rather focus purely on core UI functional testing.

I also wouldn't automate the comparison between the backend and the UI. Since this site runs on Next.js, data processing happens on the client side, and sometimes —like in this specific case— the data or API calls requested by the front-end after sorting aren't even exposed. So trying to sync both would just be a headache and wouldn't add real value.

---

## 2) If Liverpool added a CAPTCHA to the search flow, how would you handle it in your test suite?

Honestly, in a controlled environment like QA, this shouldn't even happen because it completely kills the pipeline by triggering timeouts.

If a CAPTCHA ever becomes an issue, I'd ask the dev team to let us bypass it using a specific cookie or a token. If that's not an option, I'd just straight up ask them to disable it in the test environment altogether, since keeping it active defeats the purpose of running automated suites.

---

## 3) What flakiness risks exist in this test, and how did you mitigate them?

I designed the framework using smart waits based on Playwright's 4 locator states for specific edge cases, which really helped cut down on flakiness. Also, trying to validate the UI against the backend doesn't work reliably here because Liverpool uses Next.js; all data processing happens client-side, and the actual service returning the sorted products isn't exposed.

As for the pipeline, I made it as fast as possible by leveraging caching. However, since I don't know the exact hardware specs of where this runs, handling heavy parallelism can be tricky. In this standard CI setup, running more than 2 workers makes things super unstable due to resource limits. To properly scale parallelism, we'd need to run it locally or upgrade to a better, controlled CI/CD environment —like self-hosted runners or a tier-paid GitHub plan.

Lastly, I exposed a 'retries' input parameter in the workflow so users can trigger re-runs if network blips or minor instabilities happen.

---

## 4) If you had to add this to a team's CI pipeline running 50+ other test suites, what would you change?

To scale this for 50+ test suites, I'd make the pipeline standardized and reusable across consumer projects, maybe using Git submodules or a Shared GitHub Action so teams can just consume it as a template.

I'd also switch to a custom Docker image that comes pre-packaged with all the required drivers and dependencies to shave off installation time. On top of that, I'd wrap the execution logic in a Bash or Shell script that takes parameters like suite tags, workers, retries, and browsers, and dynamically builds the native Playwright command behind the scenes. Basically, the goal is to build a highly standardized, plug-and-play pipeline template.

---


