#!/usr/bin/env node

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const REPO = "blackbodyrad/bbr-claude-skills";
const BRANCH = "main";
const INSTALL_DIR = path.join(process.env.HOME, ".bbr-claude-skills");
const REPO_DIR = path.join(INSTALL_DIR, "repo");
const VERSION_FILE = path.join(INSTALL_DIR, ".version");

const BLUE = "\x1b[34m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const NC = "\x1b[0m";

const info = (msg) => console.log(`${BLUE}[INFO]${NC} ${msg}`);
const ok = (msg) => console.log(`${GREEN}  [OK]${NC} ${msg}`);
const warn = (msg) => console.log(`${YELLOW}[WARN]${NC} ${msg}`);
const fail = (msg) => { console.log(`${RED}[ERROR]${NC} ${msg}`); process.exit(1); };

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: opts.silent ? "pipe" : "inherit", ...opts }).trim();
  } catch { return null; }
}

function ensureGit() {
  if (!run("git --version", { silent: true })) fail("git is required. Install it first.");
}

function cloneOrPull() {
  fs.mkdirSync(INSTALL_DIR, { recursive: true });

  if (fs.existsSync(REPO_DIR)) {
    info("Pulling latest...");
    run(`git -C "${REPO_DIR}" fetch origin ${BRANCH} --quiet`);
    run(`git -C "${REPO_DIR}" reset --hard origin/${BRANCH} --quiet`);
  } else {
    info("Cloning repository...");
    run(`git clone --depth 1 --branch ${BRANCH} https://github.com/${REPO}.git "${REPO_DIR}"`, { silent: true });
  }
}

function linkSkills(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  const skillsSource = path.join(REPO_DIR, "skills");
  if (!fs.existsSync(skillsSource)) fail("No skills directory found in repo.");

  let installed = 0;
  for (const name of fs.readdirSync(skillsSource)) {
    const src = path.join(skillsSource, name);
    if (!fs.statSync(src).isDirectory()) continue;

    const dest = path.join(targetDir, name);

    // Remove existing symlink
    try {
      if (fs.lstatSync(dest).isSymbolicLink()) fs.unlinkSync(dest);
      else if (fs.statSync(dest).isDirectory()) {
        warn(`Skipping '${name}' - directory exists (not managed by this installer)`);
        continue;
      }
    } catch {}

    fs.symlinkSync(src, dest);
    ok(name);
    installed++;
  }
  return installed;
}

function saveVersion(count, scope, targetDir) {
  const hash = run(`git -C "${REPO_DIR}" rev-parse --short HEAD`, { silent: true });
  const meta = { version: hash, date: new Date().toISOString(), skills: count, scope, target: targetDir };
  fs.writeFileSync(VERSION_FILE, JSON.stringify(meta, null, 2));
}

// ── Commands ─────────────────────────────────────────

async function cmdInstall() {
  console.log("");
  console.log(`${CYAN}${BOLD}  BBR Claude Skills${NC}`);
  console.log(`${DIM}  Community skill collection for Claude Code${NC}`);
  console.log("");

  ensureGit();

  // Scope selection
  console.log(`  ${BOLD}Where should skills be installed?${NC}`);
  console.log("");
  console.log(`  ${GREEN}1${NC}  Global ${DIM}(~/.claude/skills/)${NC}`);
  console.log(`     Available in all your projects`);
  console.log("");
  console.log(`  ${GREEN}2${NC}  Project ${DIM}(.claude/skills/)${NC}`);
  console.log(`     Only this project, can commit to git for team sharing`);
  console.log("");

  const choice = await ask(`  Choose [${BOLD}1${NC}/${BOLD}2${NC}]: `);

  let targetDir;
  let scope;

  if (choice === "2") {
    scope = "project";
    targetDir = path.join(process.cwd(), ".claude", "skills");
    info(`Installing to project: ${targetDir}`);
  } else {
    scope = "global";
    targetDir = path.join(process.env.HOME, ".claude", "skills");
    info(`Installing globally: ${targetDir}`);
  }

  console.log("");
  cloneOrPull();

  info("Linking skills...");
  const count = linkSkills(targetDir);
  saveVersion(count, scope, targetDir);

  console.log("");
  console.log(`${GREEN}${BOLD}  Done!${NC} ${count} skill(s) installed (${scope}).`);
  console.log("");
  console.log(`  ${DIM}Update anytime:${NC}  npx bbr-claude-skills update`);
  console.log(`  ${DIM}List skills:${NC}     npx bbr-claude-skills list`);
  console.log(`  ${DIM}Uninstall:${NC}       npx bbr-claude-skills uninstall`);
  console.log("");
}

function cmdUpdate() {
  ensureGit();

  if (!fs.existsSync(REPO_DIR)) fail("Not installed yet. Run: npx bbr-claude-skills");

  const meta = fs.existsSync(VERSION_FILE) ? JSON.parse(fs.readFileSync(VERSION_FILE, "utf8")) : {};
  const oldHash = run(`git -C "${REPO_DIR}" rev-parse --short HEAD`, { silent: true });

  cloneOrPull();

  const newHash = run(`git -C "${REPO_DIR}" rev-parse --short HEAD`, { silent: true });

  if (oldHash === newHash) {
    ok(`Already on latest (${newHash})`);
    return;
  }

  const targetDir = meta.target || path.join(process.env.HOME, ".claude", "skills");
  info(`Relinking to ${targetDir}...`);
  const count = linkSkills(targetDir);
  saveVersion(count, meta.scope || "global", targetDir);

  console.log("");
  ok(`Updated ${oldHash} -> ${newHash} (${count} skills)`);
}

function cmdList() {
  const skillsDir = path.join(REPO_DIR, "skills");
  if (!fs.existsSync(skillsDir)) { warn("No skills installed."); return; }

  console.log("");
  console.log(`${CYAN}${BOLD}  Installed Skills${NC}`);
  console.log(`  ${"─".repeat(40)}`);

  for (const name of fs.readdirSync(skillsDir)) {
    const skillFile = path.join(skillsDir, name, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, "utf8");
    const descMatch = content.match(/^description:\s*(.+)$/m);
    const desc = descMatch ? descMatch[1].slice(0, 80) : "No description";

    console.log(`  ${GREEN}${name}${NC}`);
    console.log(`  ${DIM}${desc}${NC}`);
    console.log("");
  }
}

function cmdVersion() {
  if (!fs.existsSync(VERSION_FILE)) { warn("Not installed."); return; }
  const meta = JSON.parse(fs.readFileSync(VERSION_FILE, "utf8"));
  console.log("");
  console.log(`  Version:  ${meta.version}`);
  console.log(`  Scope:    ${meta.scope}`);
  console.log(`  Skills:   ${meta.skills}`);
  console.log(`  Date:     ${meta.date}`);
  console.log(`  Target:   ${meta.target}`);
  console.log("");
}

async function cmdUninstall() {
  if (!fs.existsSync(INSTALL_DIR)) { warn("Nothing to uninstall."); return; }

  const answer = await ask(`${YELLOW}Remove all BBR skills? (y/N):${NC} `);
  if (answer.toLowerCase() !== "y") { info("Cancelled."); return; }

  const meta = fs.existsSync(VERSION_FILE) ? JSON.parse(fs.readFileSync(VERSION_FILE, "utf8")) : {};
  const targetDir = meta.target || path.join(process.env.HOME, ".claude", "skills");

  // Remove symlinks pointing to our repo
  if (fs.existsSync(targetDir)) {
    for (const name of fs.readdirSync(targetDir)) {
      const full = path.join(targetDir, name);
      try {
        if (fs.lstatSync(full).isSymbolicLink()) {
          const linkTarget = fs.readlinkSync(full);
          if (linkTarget.includes(".bbr-claude-skills")) {
            fs.unlinkSync(full);
            ok(`Removed: ${name}`);
          }
        }
      } catch {}
    }
  }

  fs.rmSync(INSTALL_DIR, { recursive: true, force: true });
  ok("Uninstalled.");
}

function cmdHelp() {
  console.log("");
  console.log(`${CYAN}${BOLD}  BBR Claude Skills${NC}`);
  console.log("");
  console.log("  Usage: npx bbr-claude-skills [command]");
  console.log("");
  console.log("  Commands:");
  console.log(`    ${GREEN}(none)${NC}      Interactive install with scope selection`);
  console.log(`    ${GREEN}update${NC}      Pull latest skills from GitHub`);
  console.log(`    ${GREEN}list${NC}        Show installed skills`);
  console.log(`    ${GREEN}version${NC}     Show current version info`);
  console.log(`    ${GREEN}uninstall${NC}   Remove all managed skills`);
  console.log(`    ${GREEN}help${NC}        Show this message`);
  console.log("");
}

// ── Router ───────────────────────────────────────────

const cmd = process.argv[2] || "install";

const commands = {
  install: cmdInstall,
  update: cmdUpdate,
  list: cmdList,
  version: cmdVersion,
  uninstall: cmdUninstall,
  help: cmdHelp,
};

const handler = commands[cmd];
if (!handler) { warn(`Unknown command: ${cmd}`); cmdHelp(); process.exit(1); }

Promise.resolve(handler()).catch((err) => { fail(err.message); });
