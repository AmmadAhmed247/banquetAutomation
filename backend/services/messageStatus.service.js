
const statusStore = new Map();

function recordStatus(messageId, status, rawTimestamp) {
  const entry = {
    status,
    timestamp: Date.now(),
    metaTimestamp: rawTimestamp ? Number(rawTimestamp) * 1000 : null, // Meta sends unix seconds
  };
  statusStore.set(messageId, entry);
  console.log(`[STATUS] ${messageId} -> ${status} (recorded at ${entry.timestamp})`);
}

function getStatus(messageId) {
  return statusStore.get(messageId) || null;
}

function waitForDeliveryStatus(messageId, { targetStatuses = ["delivered", "read"], timeoutMs = 8000, pollIntervalMs = 200 } = {}) {
  const startedAt = Date.now();
  console.log(`[WAIT] Starting wait for ${messageId}, timeout ${timeoutMs}ms`);

  return new Promise((resolve) => {
    const check = () => {
      const entry = getStatus(messageId);

      if (entry && targetStatuses.includes(entry.status)) {
        console.log(`[WAIT] ${messageId} reached "${entry.status}" after ${Date.now() - startedAt}ms`);
        return resolve({ success: true, status: entry.status, waitedMs: Date.now() - startedAt });
      }

      if (Date.now() - startedAt >= timeoutMs) {
        console.log(`[WAIT] ${messageId} TIMED OUT after ${timeoutMs}ms, last known status: ${entry?.status || "none"}`);
        return resolve({ success: false, status: entry?.status || "timeout", waitedMs: Date.now() - startedAt });
      }

      setTimeout(check, pollIntervalMs);
    };
    check();
  });
}

module.exports = { recordStatus, getStatus, waitForDeliveryStatus };