const MODULE_ID = "doroga-priklyuchenij";
const PACK_ID = `${MODULE_ID}.Magomed-Artur`;
const ADVENTURE_ID = "bphXMqM3odq3z373";
const ADVENTURE_UUID = `Compendium.${PACK_ID}.Adventure.${ADVENTURE_ID}`;
const SCENE_ID = "5dsM3JH48CsLGIJu";
const JOURNAL_ID = "cQMda3Uud8dJ9zai";
const INTRO_PAGE_ID = "OfRPdH7QsTHYsGIZ";
const CSS_CLASS = "doroga-adventure";
const sizedImporters = new WeakSet();
const OPTIONS = [
  {name: "dorogaActivateStartingScene", label: "ActivateScene", initial: true},
  {name: "dorogaDisplayJournal", label: "DisplayJournal", initial: true},
  {name: "dorogaCustomizeWorld", label: "CustomizeWorld", initial: false}
];
const localize = key => game.i18n.localize(`DOROGA.${key}`);
const enabled = value => value === true || value === "true";

function isModuleAdventure(adventure) {
  return adventure?.pack === PACK_ID || adventure?.uuid === ADVENTURE_UUID;
}

Hooks.once("init", () => {
  for (const key of ["adventurePrompted", "quickstartConfigured"]) {
    game.settings.register(MODULE_ID, key, {
      scope: "world", config: false, type: Boolean, default: false
    });
  }
});

// Only this module's V14 importer receives branding and additional options.
Hooks.on("renderAdventureImporterV2", (app, html) => {
  if (!isModuleAdventure(app.adventure)) return;
  app.element.classList.add(CSS_CLASS);
  if (!sizedImporters.has(app)) {
    sizedImporters.add(app);
    app.setPosition?.({width: Math.min(920, (globalThis.innerWidth ?? 968) - 48)});
  }
  const controls = html.querySelector(".import-controls");
  if (!controls || html.querySelector(".doroga-import-options")) return;
  const section = createOptions();
  const column = document.createElement("div");
  column.className = "doroga-import-column";
  controls.replaceWith(column);
  column.append(controls, section);
});

function createOptions(options = OPTIONS) {
  const section = document.createElement("section");
  section.className = "doroga-import-options";
  const heading = document.createElement("h2");
  heading.textContent = localize("Options");
  section.append(heading);
  for (const {name, label, initial} of options) {
    const field = document.createElement("label");
    field.className = "checkbox";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.checked = initial;
    const text = document.createElement("span");
    text.textContent = localize(label);
    field.append(checkbox, text);
    section.append(field);
  }
  return section;
}

async function customizeWorld() {
  const {description, background} = game.modules.get(MODULE_ID).quickstart.world;
  const data = {description, background};
  const response = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute("setup"), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({action: "editWorld", id: game.world.id, ...data})
  });
  if (response?.error) throw new Error(response.error);
  game.world.updateSource(data);
}

// A failure in one optional action must not prevent the remaining actions.
async function applyOptions(options) {
  const actions = [
    ["dorogaActivateStartingScene", "ActivateScene", async () => {
      const scene = game.scenes.get(SCENE_ID);
      if (!scene) throw new Error(localize("MissingScene"));
      await scene.activate();
    }],
    ["dorogaDisplayJournal", "DisplayJournal", async () => {
      const journal = game.journal.get(JOURNAL_ID);
      if (!journal) throw new Error(localize("MissingJournal"));
      await journal.sheet.render(true, {pageId: INTRO_PAGE_ID});
    }],
    ["dorogaCustomizeWorld", "CustomizeWorld", customizeWorld]
  ];
  let success = true;
  for (const [name, label, action] of actions) {
    if (!enabled(options[name])) continue;
    try { await action(); }
    catch (error) {
      success = false;
      console.error(`[${MODULE_ID}] ${label}`, error);
      ui.notifications.warn(`${localize(label)}: ${error.message}`);
    }
  }
  return success;
}

Hooks.on("preImportAdventure", (adventure, options) => {
  if (!isModuleAdventure(adventure) || !game.user.isGM) return;
  options.postImport ??= [];
  options.postImport.push(async () => {
    await applyOptions(options);
    await game.settings.set(MODULE_ID, "adventurePrompted", true);
  });
});

Hooks.once("ready", async () => {
  if (!game.user.isGM || !game.users.activeGM?.isSelf) return;
  try {
    const imported = game.settings.get("core", "adventureImports")?.[ADVENTURE_UUID];
    const quickstarted = imported?.quickstart?.quickstarted === true;
    if (quickstarted) {
      // Setup already imported all content. Never re-import it on world startup.
      if (!game.settings.get(MODULE_ID, "quickstartConfigured")) {
        const success = await applyOptions({
          dorogaActivateStartingScene: true,
          dorogaDisplayJournal: true
        });
        if (success) await game.settings.set(MODULE_ID, "quickstartConfigured", true);
      }
      // Also clear an unfinished gate left by earlier versions of the module.
      if (!imported.quickstart.postImport) {
        const imports = game.settings.get("core", "adventureImports");
        await game.settings.set("core", "adventureImports", {
          ...imports,
          [ADVENTURE_UUID]: {...imported, quickstart: {...imported.quickstart, postImport: true}}
        });
      }
      return;
    }
    if (imported || game.settings.get(MODULE_ID, "adventurePrompted")) return;
    const pack = game.packs.get(PACK_ID);
    if (!pack) throw new Error(localize("MissingPack"));
    const adventure = await pack.getDocument(ADVENTURE_ID);
    if (!adventure) throw new Error(localize("MissingAdventure"));
    await adventure.sheet.render(true);
    await game.settings.set(MODULE_ID, "adventurePrompted", true);
  } catch (error) {
    console.error(`[${MODULE_ID}]`, error);
    ui.notifications.error(`${localize("StartupError")}: ${error.message}`);
  }
});
