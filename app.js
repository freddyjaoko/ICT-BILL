const RECIPIENTS = [
  "cna@parliament.go.ke",
  "financecommitteena@parliament.go.ke",
].join(",");

const SUBJECT =
  "PUBLIC MEMORANDUM ON THE KENYA INFORMATION AND COMMUNICATION (AMENDMENT) BILL, 2025";

const form = document.getElementById("memo-form");
const nameInput = document.getElementById("full-name");
const idInput = document.getElementById("id-number");
const countySelect = document.getElementById("county");
const constituencySelect = document.getElementById("constituency");
const preview = document.getElementById("letter-preview");
const gmailBtn = document.getElementById("gmail-btn");
const copyBtn = document.getElementById("copy-btn");
const statusEl = document.getElementById("status");

function formatDate(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getValues() {
  return {
    name: nameInput.value.trim(),
    idNumber: idInput.value.trim(),
    county: countySelect.value,
    constituency: constituencySelect.value,
  };
}

function isComplete(values) {
  return Boolean(
    values.name && values.idNumber && values.county && values.constituency
  );
}

function buildLetter(values) {
  const name = values.name || "John Doe";
  const idNumber = values.idNumber || "00000000";
  const constituency = values.constituency
    ? `${values.constituency} Constituency`
    : "Example Constituency";
  const county = values.county ? `${values.county} County` : "Example County";

  return [
    "Clerk of the National Assembly",
    "Parliament of Kenya",
    "Parliament Road, Nairobi",
    "",
    formatDate(new Date()),
    "",
    "RE: PUBLIC MEMORANDUM ON THE KENYA INFORMATION AND COMMUNICATION (AMENDMENT) BILL, 2025",
    "",
    "1. IDENTIFICATION & JURISDICTION",
    `I, ${name}, holder of National Identity Card Number ${idNumber}, a resident of ${constituency}, ${county}, and a citizen of the Republic of Kenya, submit this memorandum in exercise of my right to public participation under Articles 1(1), 10(2)(a), and 118(1)(b) of the Constitution of Kenya.`,
    "",
    "2. PETITIONER'S POSITION",
    "Having reviewed the contents of the Bill, I formally OPPOSE the Kenya Information and Communication (Amendment) Bill, 2025.",
    "",
    "3. GROUNDS FOR POSITION",
    "My position is informed by a comprehensive review of the legislative proposals and their anticipated impact on the socio-economic welfare of the people of Kenya. I find the current draft requires significant reconsideration to align with the principles of social justice, transparency, and economic sustainability.",
    "",
    "In particular, the proposed amendments risk increasing the cost of internet access for ordinary Kenyans. Additional licensing, compliance, and intermediary obligations will be passed on to consumers as higher data prices, widening the digital divide and undermining affordable access to information. The same framework also creates openings for expanded state surveillance of digital communications, with insufficient safeguards for privacy, due process, and protection against arbitrary monitoring, contrary to Articles 31 and 33 of the Constitution of Kenya.",
    "",
    "4. PRAYER",
    "Therefore, I respectfully pray that the Committee:",
    "1. Acknowledges receipt of this citizen submission.",
    "2. Formally factors this position during the Committee's reading and report making.",
    "3. Ultimately Rejects the Bill in accordance with the will of the people.",
    "",
    "Respectfully submitted,",
    name,
    "Citizen of the Republic of Kenya",
  ].join("\n");
}

function gmailUrl(letter) {
  return (
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(RECIPIENTS)}` +
    `&su=${encodeURIComponent(SUBJECT)}` +
    `&body=${encodeURIComponent(letter)}`
  );
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function gmailAppUrl(letter) {
  return (
    "googlegmail:///co" +
    `?to=${encodeURIComponent(RECIPIENTS)}` +
    `&subject=${encodeURIComponent(SUBJECT)}` +
    `&body=${encodeURIComponent(letter)}`
  );
}

function androidGmailIntentUrl(letter) {
  const query =
    `?subject=${encodeURIComponent(SUBJECT)}` +
    `&body=${encodeURIComponent(letter)}`;
  return (
    `intent://${RECIPIENTS}${query}` +
    "#Intent;scheme=mailto;package=com.google.android.gm;end"
  );
}

function openGmail(letter) {
  const webUrl = gmailUrl(letter);
  if (!isMobile()) {
    window.open(webUrl, "_blank", "noopener");
    return;
  }

  if (isAndroid()) {
    window.location.href = androidGmailIntentUrl(letter);
    return;
  }

  const started = Date.now();
  window.location.href = gmailAppUrl(letter);
  window.setTimeout(() => {
    if (document.hidden) return;
    if (Date.now() - started < 1600) {
      window.location.href = webUrl;
    }
  }, 800);
}

function populateCounties() {
  const counties = Object.keys(COUNTIES);
  for (const county of counties) {
    const option = document.createElement("option");
    option.value = county;
    option.textContent = county;
    countySelect.appendChild(option);
  }
}

function populateConstituencies(county) {
  constituencySelect.innerHTML = "";
  if (!county) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select county first";
    constituencySelect.appendChild(option);
    constituencySelect.disabled = true;
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select constituency";
  constituencySelect.appendChild(placeholder);

  for (const constituency of COUNTIES[county]) {
    const option = document.createElement("option");
    option.value = constituency;
    option.textContent = constituency;
    constituencySelect.appendChild(option);
  }
  constituencySelect.disabled = false;
}

function currentLetter() {
  return preview.value;
}

function refresh() {
  const values = getValues();
  preview.value = buildLetter(values);
  const ready = isComplete(values);
  gmailBtn.disabled = !ready;
  copyBtn.disabled = !ready;
}

countySelect.addEventListener("change", () => {
  populateConstituencies(countySelect.value);
  refresh();
});

form.addEventListener("input", refresh);
form.addEventListener("change", refresh);

gmailBtn.addEventListener("click", () => {
  const values = getValues();
  if (!isComplete(values)) return;
  openGmail(currentLetter());
});

copyBtn.addEventListener("click", async () => {
  const values = getValues();
  if (!isComplete(values)) return;
  try {
    await navigator.clipboard.writeText(currentLetter());
    statusEl.textContent = "Letter copied to clipboard.";
  } catch {
    statusEl.textContent =
      "Could not copy automatically. Select the preview and copy it.";
  }
});

populateCounties();
refresh();
