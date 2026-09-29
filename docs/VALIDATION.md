# First repair validation

29 September 2026. Base revision: a3819abd (full hash is recorded in the patch installer).

- Foundry 1.7.1: `forge fmt --check` passed.
- `forge test -vv`: 10 passed, 0 failed. The unauthorized-mint fuzz test ran 256 cases.
- Fresh frontend installation: `npm ci` passed with the updated lockfile.
- `npm run check`: TypeScript strict checking passed.
- `npm run build`: Vite production build passed, 1,483 modules transformed.
- Build emitted a stale Browserslist-data warning; dependency security has not been audited.
- Browser screenshot capture failed at launch with `socket() failed: Operation not permitted`. Responsive rendering and wallet connection are not visually verified here.
- No blockchain broadcast, remote commit, push, or deployment was performed.

The patch closes unrestricted issuance in the source and updates deployment/test setup. It does not patch historical deployments or resolve the remaining vault/oracle issues documented in README.md. The frontend deliberately has no configured contract addresses and blocks all contract reads/writes until migration is validated. Injected-wallet connection is retained.

The installer also untracks committed node_modules directories while leaving local copies on disk. The earlier incomplete `interface/` source remains available; `stratum-interface/` is the canonical runnable frontend.

## Workbench design and desktop captures

The subsequent workbench redesign passed TypeScript checking and a Vite production build (1,477 modules transformed). User-supplied screenshots establish that the redesigned desktop interface renders locally and displays the expected Base scenario values. They do not establish interaction, mobile, wallet, or on-chain validation. No contract logic changed during this design pass.
