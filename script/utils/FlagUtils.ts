export async function gatherFlags(flagsInput: any): Promise<any> {
  const flagElements = document.querySelectorAll("[data-flag-values]");
  if (flagElements.length === 0) return undefined;

  const currentScript = document.currentScript as HTMLScriptElement;
  let flagsModuleUrl = new URL(currentScript.src);
  flagsModuleUrl.pathname = flagsModuleUrl.pathname.replace(
    "/script.js",
    "/flags/script.js"
  );

  try {
    const module = await import(flagsModuleUrl.href);
    return module.gather(flagElements, flagsInput);
  } catch (error) {
    console.error("Erro ao carregar flags", error);
  }
}
