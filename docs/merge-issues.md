# Merge issue notes

The current branch fails lint checks, which blocks merging. Running `npm run lint -- --max-warnings=0` produces hundreds of existing errors (mostly `no-explicit-any`, hook dependency warnings, and similar) across `src/components` and Supabase functions. These issues predate the CTA changes, but they cause the pipeline to fail and stop merges until resolved or excluded.

To unblock merges, either fix the reported lint errors or update lint configuration to exclude legacy paths until they can be cleaned up.
