import { getAppDomRefs } from "./app/domRefs.js?v=rmk-sim-db-v1";
import { bindGlobalFilters } from "./app/globalFilters.js?v=rmk-sim-db-v1";
import { router } from "./app/router.js?v=rmk-sim-db-v1";

const refs = getAppDomRefs();
const runRouter = () => router(refs);

bindGlobalFilters(refs, runRouter);
window.addEventListener("DOMContentLoaded", runRouter);
window.addEventListener("hashchange", runRouter);
