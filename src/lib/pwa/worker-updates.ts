/** Observe updates without reloading a page until this tab accepts the update. */
export function observeWorkerUpdates(
  workers: ServiceWorkerContainer,
  onUpdate: (activate: () => void) => (() => void),
  reload: () => void,
) {
  let disposed = false;
  let accepted = false;
  let refreshing = false;
  let registration: ServiceWorkerRegistration | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;
  const cleanup: (() => void)[] = [];
  const watched = new Set<ServiceWorker>();
  const prompted = new Set<ServiceWorker>();

  function prompt(worker: ServiceWorker) {
    if (disposed || prompted.has(worker) || !workers.controller) return;
    prompted.add(worker);
    cleanup.push(onUpdate(() => {
      if (disposed) return;
      accepted = true;
      if (worker.state === "installed") worker.postMessage({ type: "SKIP_WAITING" });
      else controllerChanged(); // Another tab may already have activated it.
    }));
  }
  function watchInstalling() {
    const worker = registration?.installing;
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    const stateChanged = () => { if (worker.state === "installed") prompt(worker); };
    worker.addEventListener("statechange", stateChanged);
    cleanup.push(() => worker.removeEventListener("statechange", stateChanged));
    stateChanged();
  }
  function update() {
    if (!disposed && document.visibilityState === "visible") {
      registration?.update().catch(() => undefined);
    }
  }
  function controllerChanged() {
    if (disposed || !accepted || refreshing) return;
    refreshing = true;
    reload();
  }
  workers.addEventListener("controllerchange", controllerChanged);
  workers.register("/sw.js", { scope: "/", updateViaCache: "none" }).then((registered) => {
    if (disposed) return;
    registration = registered;
    if (registration.waiting) prompt(registration.waiting);
    watchInstalling();
    registration.addEventListener("updatefound", watchInstalling);
    document.addEventListener("visibilitychange", update);
    cleanup.push(() => registered.removeEventListener("updatefound", watchInstalling));
    cleanup.push(() => document.removeEventListener("visibilitychange", update));
    interval = setInterval(update, 60_000);
  }).catch(() => undefined);

  return () => {
    disposed = true;
    if (interval !== undefined) clearInterval(interval);
    workers.removeEventListener("controllerchange", controllerChanged);
    cleanup.forEach(dispose => dispose());
  };
}
