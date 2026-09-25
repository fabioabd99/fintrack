import { z } from "zod";

// Zod's JIT probes `new Function`, which the CSP blocks and reports on every
// page. Jitless mode avoids that.
z.config({ jitless: true });
