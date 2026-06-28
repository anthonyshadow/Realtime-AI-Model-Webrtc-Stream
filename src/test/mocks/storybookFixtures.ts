export const portraitPreviewUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23171717'/%3E%3Ccircle cx='80' cy='58' r='30' fill='%2367e8f9'/%3E%3Cpath d='M35 140c8-35 32-50 45-50s37 15 45 50' fill='%23e5e7eb'/%3E%3C/svg%3E";

export const garmentPreviewUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23171717'/%3E%3Cpath d='M49 38 70 26h20l21 12 18 32-22 12-8-18v66H61V64l-8 18-22-12z' fill='%2334d399'/%3E%3Cpath d='M70 26c3 9 17 9 20 0' fill='none' stroke='%23050505' stroke-width='5'/%3E%3C/svg%3E";

export function createMockImageFile(name: string, type: string) {
  if (typeof File === "undefined") {
    return null;
  }

  return new File(["storybook image placeholder"], name, {
    type,
  });
}
