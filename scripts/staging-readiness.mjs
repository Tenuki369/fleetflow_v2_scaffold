const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg ? modeArg.slice("--mode=".length) : "staging";

const groups = {
  core: [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
  storage: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET"],
};

const optional = {
  storage: ["AWS_REGION", "S3_ENDPOINT", "S3_PUBLIC_URL"],
};

const placeholderFragments = [
  "YOUR_",
  "example",
  "pk_test_...",
  "sk_test_...",
  "whsec_...",
  "postgresql://USER:PASSWORD",
  "<accountid>",
];

function isMissing(value) {
  return !value || placeholderFragments.some((fragment) => value.includes(fragment));
}

function checkVars(names) {
  return names.filter((name) => isMissing(process.env[name]));
}

const missingCore = checkVars(groups.core);
const missingStorage = checkVars(groups.storage);

const summary = {
  mode,
  coreReady: missingCore.length === 0,
  storageReady: missingStorage.length === 0,
  missing: {
    core: missingCore,
    storage: missingStorage,
  },
  optional: {
    storage: optional.storage.filter((name) => !process.env[name]),
  },
};

console.log(JSON.stringify(summary, null, 2));

if (missingCore.length > 0 || (mode !== "app-only" && missingStorage.length > 0)) {
  process.exit(1);
}
