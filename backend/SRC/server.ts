import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { retrySyncQueue } from "./services/leadService";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Aryora API listening on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Step 8: retry failed cloud-spreadsheet syncs every 5 minutes with error logging.
setInterval(() => {
  retrySyncQueue().catch((err) => console.error("Lead sync retry queue error:", err));
}, 5 * 60 * 1000);
